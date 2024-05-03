import { DomainEvent } from '../../lib/domain-event';

type HeadOfficeCreatedEventPayload = Record<string, never>;

export class HeadOfficeCreatedEvent extends DomainEvent<HeadOfficeCreatedEventPayload> {}
