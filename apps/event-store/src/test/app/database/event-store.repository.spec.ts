import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import EventStoreEntity from '../../../app/database/event-store/event-store.entity';
import { MikroOrmEventStoreRepository } from '../../../app/database/event-store/event-store.repository';

describe('MikroOrmEventStoreRepository', () => {
  let entityManager: EntityManager;
  let repository: MikroOrmEventStoreRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MikroOrmEventStoreRepository,
        {
          provide: getRepositoryToken(EventStoreEntity),
          useClass: EntityRepository<EventStoreEntity>,
        },
        {
          provide: EntityManager,
          useValue: { persistAndFlush: jest.fn() },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmEventStoreRepository>(MikroOrmEventStoreRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#save', () => {
    it('should call ormRepository.persistAndFlush with any eventStoreEntity', async () => {
      jest.spyOn(entityManager, 'persistAndFlush');
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

      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(eventEntity);
    });
  });
});
