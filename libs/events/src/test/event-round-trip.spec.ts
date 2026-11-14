import { Type } from '@nestjs/common';
import { CqrsModule, EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { APP_NAME_TOKEN, Id } from '@vending-machines/shared';
import { EJSON } from 'bson';
import { randomUUIDv7 } from 'node:crypto';
import { BalanceChangedEvent, MoneyLoadedEvent } from '../event-declarations';
import { AggregateType } from '../lib/aggregate-type';
import { AmqpService } from '../lib/amqp/amqp.service';
import { EXCHANGE_NAME } from '../lib/constants';
import { EventPublisher } from '../lib/event-publisher';
import { EventSubscriber } from '../lib/event-subscriber';
import { ExplorerService } from '../lib/services/explorer.service';

class RecordingTestHandler<TEvent extends IEvent> implements IEventHandler<TEvent> {
  readonly received: TEvent[] = [];

  handle(event: TEvent): void {
    this.received.push(event);
  }
}

@EventsHandler(BalanceChangedEvent)
class BalanceChangedTestHandler extends RecordingTestHandler<BalanceChangedEvent> {
  static readonly subscriptionName = 'projection';
}

@EventsHandler(BalanceChangedEvent)
class AnotherBalanceChangedTestHandler extends BalanceChangedTestHandler {}

@EventsHandler(BalanceChangedEvent)
class AuditBalanceChangedTestHandler extends RecordingTestHandler<BalanceChangedEvent> {
  static readonly subscriptionName = 'audit';
}

@EventsHandler(BalanceChangedEvent)
class UnnamedBalanceChangedTestHandler extends RecordingTestHandler<BalanceChangedEvent> {}

@EventsHandler(BalanceChangedEvent)
class BadlyNamedBalanceChangedTestHandler extends RecordingTestHandler<BalanceChangedEvent> {
  static readonly subscriptionName = 'Audit.Log';
}

@EventsHandler(BalanceChangedEvent, MoneyLoadedEvent)
class MultiEventTestHandler extends RecordingTestHandler<BalanceChangedEvent | MoneyLoadedEvent> {
  static readonly subscriptionName = 'multi';
}

describe('Event round trip', () => {
  const amqpService = {
    publish: vi.fn<AmqpService['publish']>(),
    addSubscriber: vi.fn<AmqpService['addSubscriber']>(),
  };
  let publisher: EventPublisher<IEvent>;
  let handler: BalanceChangedTestHandler;
  let deliver: (content: string) => Promise<void>;

  const publishedContent = (): string => {
    const content = amqpService.publish.mock.lastCall?.[2];
    if (content === undefined) {
      throw new Error('Nothing was published');
    }
    return content;
  };

  const bootstrapWith = async (...handlers: Type[]) => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        EventSubscriber,
        ExplorerService,
        ...handlers,
        { provide: AmqpService, useValue: amqpService },
        { provide: APP_NAME_TOKEN, useValue: 'test' },
      ],
    }).compile();
    amqpService.addSubscriber.mockClear();
    module.get(EventSubscriber).onApplicationBootstrap();
    return module;
  };

  const subscriptions = () => amqpService.addSubscriber.mock.calls.map((call) => call.slice(0, 3));

  const deliverTo = async (queue: string, event: IEvent) => {
    const consumer = amqpService.addSubscriber.mock.calls.find((call) => call[2] === queue)?.[3];
    if (!consumer) {
      throw new Error(`Nothing subscribed to ${queue}`);
    }
    await consumer(Buffer.from(EJSON.stringify(event)));
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        EventPublisher,
        EventSubscriber,
        ExplorerService,
        BalanceChangedTestHandler,
        { provide: AmqpService, useValue: amqpService },
        { provide: APP_NAME_TOKEN, useValue: 'test' },
      ],
    }).compile();

    publisher = module.get(EventPublisher);
    handler = module.get(BalanceChangedTestHandler);
    module.get(EventSubscriber).onApplicationBootstrap();

    const consumer = amqpService.addSubscriber.mock.lastCall?.[3];
    if (!consumer) {
      throw new Error('EventSubscriber did not subscribe');
    }
    deliver = async (content) => {
      await consumer(Buffer.from(content));
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to its event type on a queue named after the app, the event type and the subscription name', () => {
    expect(amqpService.addSubscriber.mock.lastCall?.slice(0, 3)).toStrictEqual([
      EXCHANGE_NAME,
      'event.atm.balance-changed',
      'q.test.atm.balance-changed.projection',
    ]);
  });

  it('should publish with the event type as routing key', async () => {
    await publisher.publish(
      new BalanceChangedEvent({
        aggregateId: Id.generate(),
        aggregateType: AggregateType.Atm,
        payload: { delta: '0.01' },
      }),
    );

    expect(amqpService.publish.mock.lastCall?.[1]).toBe('event.atm.balance-changed');
  });

  it('should give each handler of one event type its own queue', async () => {
    const module = await bootstrapWith(BalanceChangedTestHandler, AuditBalanceChangedTestHandler);
    const event = new BalanceChangedEvent({
      aggregateId: Id.generate(),
      aggregateType: AggregateType.Atm,
      payload: { delta: '0.01' },
    });

    await deliverTo('q.test.atm.balance-changed.audit', event);

    expect(subscriptions()).toStrictEqual([
      [EXCHANGE_NAME, 'event.atm.balance-changed', 'q.test.atm.balance-changed.projection'],
      [EXCHANGE_NAME, 'event.atm.balance-changed', 'q.test.atm.balance-changed.audit'],
    ]);
    expect(module.get(AuditBalanceChangedTestHandler).received).toStrictEqual([event]);
    expect(module.get(BalanceChangedTestHandler).received).toHaveLength(0);
  });

  it('should refuse two handlers of one event type with the same subscription name', async () => {
    await expect(bootstrapWith(BalanceChangedTestHandler, AnotherBalanceChangedTestHandler)).rejects.toThrow(
      'test has more than one handler for atm.balance-changed with subscriptionName "projection" ' +
        '(BalanceChangedTestHandler, AnotherBalanceChangedTestHandler)',
    );
  });

  it('should refuse a handler without a subscription name', async () => {
    await expect(bootstrapWith(UnnamedBalanceChangedTestHandler)).rejects.toThrow(
      'UnnamedBalanceChangedTestHandler must declare a static kebab-case subscriptionName, got undefined',
    );
  });

  it('should refuse a subscription name that is not kebab-case', async () => {
    await expect(bootstrapWith(BadlyNamedBalanceChangedTestHandler)).rejects.toThrow(
      'BadlyNamedBalanceChangedTestHandler must declare a static kebab-case subscriptionName, got "Audit.Log"',
    );
  });

  it('should subscribe a handler of several event types to each of them', async () => {
    const module = await bootstrapWith(MultiEventTestHandler);
    const event = new MoneyLoadedEvent({
      aggregateId: Id.generate(),
      aggregateType: AggregateType.Atm,
      payload: { loadedMoney: [1, 0, 0, 0, 0, 0] },
    });

    await deliverTo('q.test.money.loaded.multi', event);

    expect(subscriptions()).toStrictEqual([
      [EXCHANGE_NAME, 'event.atm.balance-changed', 'q.test.atm.balance-changed.multi'],
      [EXCHANGE_NAME, 'event.money.loaded', 'q.test.money.loaded.multi'],
    ]);
    expect(module.get(MultiEventTestHandler).received).toStrictEqual([event]);
  });

  it('should hand a published event to its handler as an instance of the event class', async () => {
    const event = new BalanceChangedEvent({
      aggregateId: Id.generate(),
      aggregateType: AggregateType.Atm,
      payload: { delta: '0.01' },
    });

    await publisher.publish(event);
    await deliver(publishedContent());

    expect(handler.received).toHaveLength(1);
    expect(handler.received[0]).toBeInstanceOf(BalanceChangedEvent);
    expect(handler.received[0]?.timestamp).toBeInstanceOf(Date);
    expect(handler.received[0]).toStrictEqual(event);
  });

  it('should write the timestamp as a relaxed extended JSON date', async () => {
    await publisher.publish(
      new BalanceChangedEvent({
        aggregateId: Id.generate(),
        aggregateType: AggregateType.Atm,
        payload: { delta: '0.01' },
      }),
    );

    expect(publishedContent()).toMatch(/"timestamp":\{"\$date":"\d{4}-\d{2}-\d{2}T[\d:.]+Z"\}/);
  });

  it('should accept the numeric date format written by the previous ejson serializer', async () => {
    const legacyMessage = JSON.stringify({
      eventId: randomUUIDv7(),
      eventType: 'atm.balance-changed',
      timestamp: { $date: 1794574962551 },
      aggregateId: randomUUIDv7(),
      aggregateType: 'Atm',
      payload: { delta: '0.01' },
    });

    await deliver(legacyMessage);

    expect(handler.received).toHaveLength(1);
    expect(handler.received[0]?.timestamp).toEqual(new Date(1794574962551));
  });

  it('should ignore events of another type', async () => {
    const otherEvent = new MoneyLoadedEvent({
      aggregateId: Id.generate(),
      aggregateType: AggregateType.Atm,
      payload: { loadedMoney: [1, 0, 0, 0, 0, 0] },
    });

    await deliver(EJSON.stringify(otherEvent));

    expect(handler.received).toHaveLength(0);
  });
});
