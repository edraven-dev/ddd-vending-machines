import { DomainEvent } from '../../lib/domain-event';

type HeadOfficeDeletedEventPayload = Record<string, never>;

export class HeadOfficeDeletedEvent extends DomainEvent<HeadOfficeDeletedEventPayload> {}
