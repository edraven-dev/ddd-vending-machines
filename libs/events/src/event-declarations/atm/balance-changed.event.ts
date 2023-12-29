import { EventBase } from '../../lib/event-base';

type BalanceChangedEventPayload = { amountWithCommissionValue: string };

export class BalanceChangedEvent extends EventBase<BalanceChangedEventPayload> {}
