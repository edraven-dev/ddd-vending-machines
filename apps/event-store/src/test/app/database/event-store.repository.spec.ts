import type { RequiredEntityData } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { AggregateType, EventType } from '@vending-machines/events';
import { randomUUIDv7 } from 'node:crypto';
import EventStoreEntity from '../../../app/database/event-store/event-store.entity';
import { MikroOrmEventStoreRepository } from '../../../app/database/event-store/event-store.repository';

describe('MikroOrmEventStoreRepository', () => {
  const queryBuilder = {
    insert: vi.fn<(data: RequiredEntityData<EventStoreEntity>) => unknown>().mockReturnThis(),
    onConflict: vi.fn<(fields: keyof EventStoreEntity) => unknown>().mockReturnThis(),
    ignore: vi.fn<() => unknown>().mockReturnThis(),
    execute: vi.fn<() => Promise<unknown>>(),
  };
  const entityManagerMock = {
    createQueryBuilder: vi.fn<(entityName: typeof EventStoreEntity) => typeof queryBuilder>(() => queryBuilder),
  };
  let repository: MikroOrmEventStoreRepository;

  const anEvent = () => ({
    eventId: randomUUIDv7(),
    eventType: EventType.AtmCreated,
    timestamp: new Date(),
    aggregateId: randomUUIDv7(),
    aggregateType: AggregateType.Atm,
    payload: {},
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [MikroOrmEventStoreRepository, { provide: EntityManager, useValue: entityManagerMock }],
    }).compile();

    repository = module.get(MikroOrmEventStoreRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#save', () => {
    it('should insert the event and ignore a duplicate event id', async () => {
      const event = anEvent();

      await repository.save(event);

      expect(entityManagerMock.createQueryBuilder).toHaveBeenCalledWith(EventStoreEntity);
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        event_id: event.eventId,
        event_type: event.eventType,
        timestamp: event.timestamp,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        payload: event.payload,
      });
      expect(queryBuilder.onConflict).toHaveBeenCalledWith('event_id');
      expect(queryBuilder.ignore).toHaveBeenCalledOnce();
      expect(queryBuilder.execute).toHaveBeenCalledOnce();
    });

    it('should build an insert that does nothing when the event id already exists', () => {
      const orm = new MikroORM({
        dbName: 'unused',
        metadataProvider: ReflectMetadataProvider,
        entities: [EventStoreEntity],
      });
      const event = anEvent();

      const query = orm.em
        .createQueryBuilder(EventStoreEntity)
        .insert({
          event_id: event.eventId,
          event_type: event.eventType,
          timestamp: event.timestamp,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          payload: event.payload,
        })
        .onConflict('event_id')
        .ignore()
        .getQuery();

      expect(query).toMatch(/^insert into "event_store" .* on conflict \("event_id"\) do nothing/);
    });
  });
});
