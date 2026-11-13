import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type HeadOfficeDeletedEventPayload = Record<string, never>;

export class HeadOfficeDeletedEvent extends DomainEvent<HeadOfficeDeletedEventPayload> {
  static override readonly eventType = EventType.HeadOfficeDeleted;
}
