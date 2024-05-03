import { DomainEvent } from '@vending-machines/events';

export interface EventStoreRepository {
  save<T extends Record<string, unknown>>(event: DomainEvent<T>): void | Promise<void>;
}

export const EventStoreRepository = Symbol('EventStoreRepository');
