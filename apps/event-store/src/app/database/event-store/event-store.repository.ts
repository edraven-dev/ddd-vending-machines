import { EntityManager } from '@mikro-orm/core';
import { Injectable, Provider } from '@nestjs/common';
import { DomainEvent } from '@vending-machines/events';
import { EventStoreRepository } from '../../event-store/event-store.repository.interface';
import EventStoreEntity from './event-store.entity';

@Injectable()
export class MikroOrmEventStoreRepository implements EventStoreRepository {
  constructor(private readonly em: EntityManager) {}

  async save<T extends Record<string, unknown>>(event: DomainEvent<T>): Promise<void> {
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
