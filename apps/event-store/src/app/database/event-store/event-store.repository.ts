import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import { EventBase } from '@vending-machines/events';
import { EventStoreRepository } from '../../event-store/event-store.repository.interface';
import EventStoreEntity from './event-store.entity';

@Injectable()
export class MikroOrmEventStoreRepository implements EventStoreRepository {
  constructor(
    @InjectRepository(EventStoreEntity)
    private readonly eventStoreRepository: EntityRepository<EventStoreEntity>,
    private readonly em: EntityManager,
  ) {}

  async save<T extends Record<string, unknown>>(event: EventBase<T>): Promise<void> {
    const eventEntity = new EventStoreEntity();
    eventEntity.event_id = event.eventId;
    eventEntity.event_type = event.eventType;
    eventEntity.timestamp = event.timestamp;
    eventEntity.aggregate_id = event.aggregateId;
    eventEntity.aggregate_type = event.aggregateType;
    eventEntity.payload = event.payload;

    await this.em.persistAndFlush(eventEntity);
  }
}

export const EventStoreRepositoryProvider: Provider = {
  provide: EventStoreRepository,
  useClass: MikroOrmEventStoreRepository,
};
