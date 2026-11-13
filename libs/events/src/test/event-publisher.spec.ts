import { CqrsModule, type IEvent, EventPublisher as NestEventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { AggregateRoot, Id } from '@vending-machines/shared';
import { BalanceChangedEvent } from '../event-declarations';
import { AggregateType } from '../lib/aggregate-type';
import { AmqpService } from '../lib/amqp/amqp.service';
import { EXCHANGE_NAME } from '../lib/constants';
import { EventPublisher } from '../lib/event-publisher';

class TestAggregate extends AggregateRoot {}

describe('EventPublisher', () => {
  const amqpService = { publish: vi.fn<AmqpService['publish']>() };
  let publisher: EventPublisher<IEvent>;
  let nestEventPublisher: NestEventPublisher;

  const anEvent = () =>
    new BalanceChangedEvent({
      aggregateId: Id.generate(),
      aggregateType: AggregateType.Atm,
      payload: { delta: '0.01' },
    });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [EventPublisher, { provide: AmqpService, useValue: amqpService }],
    }).compile();

    publisher = module.get(EventPublisher);
    nestEventPublisher = module.get(NestEventPublisher);
  });

  afterEach(() => {
    amqpService.publish.mockReset();
  });

  describe('#publish', () => {
    it("should use a domain event's id as the AMQP message id", async () => {
      const event = anEvent();

      await publisher.publish(event);

      expect(amqpService.publish).toHaveBeenCalledWith(EXCHANGE_NAME, 'event.atm.balance-changed', expect.any(String), {
        persistent: true,
        messageId: event.eventId,
      });
    });

    it('should refuse to publish an event that is not a domain event', async () => {
      await expect(publisher.publish({ type: 'PlainEvent' })).rejects.toThrow('Object is not a domain event');
      expect(amqpService.publish).not.toHaveBeenCalled();
    });
  });

  describe('#publishAll', () => {
    it('should publish every event in order, even after the aggregate empties its events array', async () => {
      const first = anEvent();
      const second = anEvent();
      const events = [first, second];

      const publishing = publisher.publishAll(events);
      events.length = 0;
      await publishing;

      expect(amqpService.publish).toHaveBeenCalledTimes(2);
      expect(amqpService.publish.mock.calls[0]?.[2]).toContain(first.eventId);
      expect(amqpService.publish.mock.calls[1]?.[2]).toContain(second.eventId);
    });

    it('should publish one event at a time and stop at the first failure', async () => {
      amqpService.publish.mockRejectedValueOnce(new Error('Broker unavailable'));

      await expect(publisher.publishAll([anEvent(), anEvent()])).rejects.toThrow('Broker unavailable');
      expect(amqpService.publish).toHaveBeenCalledOnce();
    });
  });

  it("should make an aggregate's commit wait until all of its events are published", async () => {
    let releaseFirst: () => void = () => undefined;
    amqpService.publish.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseFirst = resolve;
        }),
    );
    const aggregate = nestEventPublisher.mergeObjectContext(new TestAggregate(Id.generate()));
    aggregate.apply(anEvent());
    aggregate.apply(anEvent());

    let committed = false;
    const committing = aggregate.commit().then(() => {
      committed = true;
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(committed).toBe(false);
    expect(amqpService.publish).toHaveBeenCalledOnce();

    releaseFirst();
    await committing;

    expect(committed).toBe(true);
    expect(amqpService.publish).toHaveBeenCalledTimes(2);
  });
});
