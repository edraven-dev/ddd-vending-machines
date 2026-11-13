import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type HeadOfficeCreatedEventPayload = Record<string, never>;

export class HeadOfficeCreatedEvent extends DomainEvent<HeadOfficeCreatedEventPayload> {
  static override readonly eventType = EventType.HeadOfficeCreated;
}
