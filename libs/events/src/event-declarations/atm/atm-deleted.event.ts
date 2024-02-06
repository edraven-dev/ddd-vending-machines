import { DomainEvent } from '../../lib/domain-event';

type AtmDeletedEventPayload = Record<string, never>;

export class AtmDeletedEvent extends DomainEvent<AtmDeletedEventPayload> {}
