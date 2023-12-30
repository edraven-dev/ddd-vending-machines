import { DomainEvent } from '../../lib/domain-event';

type BalanceChangedEventPayload = { delta: string };

export class BalanceChangedEvent extends DomainEvent<BalanceChangedEventPayload> {}
