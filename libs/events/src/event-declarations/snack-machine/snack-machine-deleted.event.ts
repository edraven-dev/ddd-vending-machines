import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type SnackMachineDeletedEventPayload = Record<string, never>;

export class SnackMachineDeletedEvent extends DomainEvent<SnackMachineDeletedEventPayload> {
  static override readonly eventType = EventType.SnackMachineDeleted;
}
