import { DomainEvent } from '../../lib/domain-event';

type AtmCreatedEventPayload = Record<string, never>;

export class AtmCreatedEvent extends DomainEvent<AtmCreatedEventPayload> {}
