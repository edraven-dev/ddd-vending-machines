import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type AtmDeletedEventPayload = Record<string, never>;

export class AtmDeletedEvent extends DomainEvent<AtmDeletedEventPayload> {
  static override readonly eventType = EventType.AtmDeleted;
}
