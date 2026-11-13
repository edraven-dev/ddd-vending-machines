import { IEvent } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import { randomUUIDv7 } from 'crypto';
import type { AggregateType } from './aggregate-type';
import type { EventType } from './event-type';

export interface IDomainEvent<T extends Record<string, unknown>> extends IEvent {
  eventId: string;
  eventType: EventType;
  timestamp: Date;
  aggregateId: string;
  aggregateType: AggregateType;
  payload: T;
}

export abstract class DomainEvent<T extends Record<string, unknown>> implements IDomainEvent<T> {
  static readonly eventType: EventType;

  public readonly eventId: string = randomUUIDv7();
  public readonly eventType: EventType;
  public readonly timestamp: Date = new Date();
  public readonly aggregateId: string;
  public readonly aggregateType: AggregateType;
  public readonly payload: T;

  constructor({ aggregateId, aggregateType, payload }: { aggregateId: Id; aggregateType: AggregateType; payload: T }) {
    this.eventType = new.target.eventType;
    this.aggregateId = aggregateId.value;
    this.aggregateType = aggregateType;
    this.payload = payload;
  }
}
