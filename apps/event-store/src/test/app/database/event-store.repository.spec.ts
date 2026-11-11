import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import EventStoreEntity from '../../../app/database/event-store/event-store.entity';
import { MikroOrmEventStoreRepository } from '../../../app/database/event-store/event-store.repository';

describe('MikroOrmEventStoreRepository', () => {
  const flush = vi.fn<() => Promise<void>>();
  const entityManagerMock = { persist: vi.fn<() => { flush: typeof flush }>(() => ({ flush })) };
  let repository: MikroOrmEventStoreRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MikroOrmEventStoreRepository,
        {
          provide: getRepositoryToken(EventStoreEntity),
          useClass: EntityRepository<EventStoreEntity>,
        },
        { provide: EntityManager, useValue: entityManagerMock },
      ],
    }).compile();

    repository = module.get<MikroOrmEventStoreRepository>(MikroOrmEventStoreRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#save', () => {
    it('should call em.persist with any eventStoreEntity and flush it', async () => {
      const event = {
        eventId: randomUUID(),
        eventType: randomUUID(),
        timestamp: new Date(),
        aggregateId: randomUUID(),
        aggregateType: randomUUID(),
        payload: {},
      };
      const eventEntity = new EventStoreEntity();
      eventEntity.event_id = event.eventId;
      eventEntity.event_type = event.eventType;
      eventEntity.timestamp = event.timestamp;
      eventEntity.aggregate_id = event.aggregateId;
      eventEntity.aggregate_type = event.aggregateType;
      eventEntity.payload = event.payload;

      await repository.save(event);

      expect(entityManagerMock.persist).toHaveBeenCalledWith(eventEntity);
      expect(flush).toHaveBeenCalledOnce();
    });
  });
});
