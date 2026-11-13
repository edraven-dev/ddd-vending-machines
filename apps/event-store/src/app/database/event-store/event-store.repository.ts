import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Provider } from '@nestjs/common';
import type { DomainEvent } from '@vending-machines/events';
import { EventStoreRepository } from '../../event-store/event-store.repository.interface';
import EventStoreEntity from './event-store.entity';

@Injectable()
export class MikroOrmEventStoreRepository implements EventStoreRepository {
  constructor(private readonly em: EntityManager) {}

  async save<T extends Record<string, unknown>>(event: DomainEvent<T>): Promise<void> {
    await this.em
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
      .execute();
  }
}

export const EventStoreRepositoryProvider: Provider = {
  provide: EventStoreRepository,
  useClass: MikroOrmEventStoreRepository,
};
