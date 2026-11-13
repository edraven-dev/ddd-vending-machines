import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type AtmCreatedEventPayload = Record<string, never>;

export class AtmCreatedEvent extends DomainEvent<AtmCreatedEventPayload> {
  static override readonly eventType = EventType.AtmCreated;
}
