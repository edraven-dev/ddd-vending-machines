import { DomainEvent } from '../../lib/domain-event';

type SnackMachineCreatedEventPayload = Record<string, never>;

export class SnackMachineCreatedEvent extends DomainEvent<SnackMachineCreatedEventPayload> {}
