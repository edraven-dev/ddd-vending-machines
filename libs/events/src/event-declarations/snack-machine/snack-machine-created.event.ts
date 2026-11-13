import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type SnackMachineCreatedEventPayload = Record<string, never>;

export class SnackMachineCreatedEvent extends DomainEvent<SnackMachineCreatedEventPayload> {
  static override readonly eventType = EventType.SnackMachineCreated;
}
