import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { EJSON } from 'bson';
import { randomUUID } from 'crypto';
import { AmqpService } from '../../../app/amqp/amqp.service';
import { EXCHANGE_NAME } from '../../../app/constants';
import EventStoreEntity from '../../../app/database/event-store/event-store.entity';
import { EventStoreRepository } from '../../../app/event-store/event-store.repository.interface';
import { EventStoreService } from '../../../app/event-store/event-store.service';

describe('EventStoreService', () => {
  const orm = new MikroORM({
    driver: PostgreSqlDriver,
    dbName: 'unused',
    metadataProvider: ReflectMetadataProvider,
    entities: [EventStoreEntity],
  });
  const amqpService = { addSubscriber: vi.fn<AmqpService['addSubscriber']>() };
  const eventStoreRepository = { save: vi.fn<EventStoreRepository['save']>() };
  let subscription: Parameters<AmqpService['addSubscriber']>;
  let deliver: (message: string) => Promise<void>;

  const anEvent = () => ({
    eventId: randomUUID(),
    eventType: 'AtmCreatedEvent',
    timestamp: new Date(),
    aggregateId: randomUUID(),
    aggregateType: 'Atm',
    payload: {},
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventStoreService,
        { provide: MikroORM, useValue: orm },
        { provide: AmqpService, useValue: amqpService },
        { provide: EventStoreRepository, useValue: eventStoreRepository },
      ],
    }).compile();

    await module.get(EventStoreService).onApplicationBootstrap();

    // Vitest clears mock calls before each test, so keep the subscription made during bootstrap.
    const lastCall = amqpService.addSubscriber.mock.lastCall;
    if (!lastCall) {
      throw new Error('EventStoreService did not subscribe');
    }
    subscription = lastCall;
    const consumer = lastCall[3];
    deliver = async (message) => {
      await consumer(Buffer.from(message));
    };
  });

  afterEach(() => {
    eventStoreRepository.save.mockReset();
  });

  it('should subscribe to every event', () => {
    expect(subscription).toEqual([EXCHANGE_NAME, 'event.#', 'q.EventStore', expect.any(Function)]);
  });

  it('should store the decoded event', async () => {
    const event = anEvent();

    await deliver(EJSON.stringify(event));

    expect(eventStoreRepository.save).toHaveBeenCalledWith(event);
  });

  it('should store each event in its own request context', async () => {
    const entityManagers: (EntityManager | undefined)[] = [];
    eventStoreRepository.save.mockImplementation(() => {
      entityManagers.push(RequestContext.getEntityManager());
    });

    await deliver(EJSON.stringify(anEvent()));
    await deliver(EJSON.stringify(anEvent()));

    expect(entityManagers).toHaveLength(2);
    expect(entityManagers[0]).toBeInstanceOf(EntityManager);
    expect(entityManagers[1]).toBeInstanceOf(EntityManager);
    expect(entityManagers[0]).not.toBe(entityManagers[1]);
    expect(entityManagers[0]).not.toBe(orm.em);
  });

  it('should reject a message whose event cannot be stored and still store the next one', async () => {
    const failing = anEvent();
    const next = anEvent();
    eventStoreRepository.save.mockRejectedValueOnce(new Error('Insert failed'));

    await expect(deliver(EJSON.stringify(failing))).rejects.toThrow('Insert failed');
    await deliver(EJSON.stringify(next));

    expect(eventStoreRepository.save).toHaveBeenLastCalledWith(next);
  });
});
