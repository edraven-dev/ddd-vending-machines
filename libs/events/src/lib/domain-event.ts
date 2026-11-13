import { IEvent } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import { randomUUIDv7 } from 'crypto';

export interface IDomainEvent<T extends Record<string, unknown>> extends IEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  aggregateId: string;
  aggregateType: string;
  payload: T;
}

export abstract class DomainEvent<T extends Record<string, unknown>> implements IDomainEvent<T> {
  public readonly eventId: string = randomUUIDv7();
  public readonly eventType: string = this.constructor.name;
  public readonly timestamp: Date = new Date();
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly payload: T;

  constructor({
    aggregateId,
    aggregateType,
    payload,
  }: {
    aggregateId: Id | string;
    aggregateType: string;
    payload: T;
  }) {
    this.aggregateId = typeof aggregateId === 'string' ? aggregateId : aggregateId.value;
    this.aggregateType = aggregateType;
    this.payload = payload;
  }
}
