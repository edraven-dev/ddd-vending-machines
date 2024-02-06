import { DomainEvent } from '../../lib/domain-event';

type SnackMachineDeletedEventPayload = Record<string, never>;

export class SnackMachineDeletedEvent extends DomainEvent<SnackMachineDeletedEventPayload> {}
