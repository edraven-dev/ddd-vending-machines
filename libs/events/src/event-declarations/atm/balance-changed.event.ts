import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type BalanceChangedEventPayload = { delta: string };

export class BalanceChangedEvent extends DomainEvent<BalanceChangedEventPayload> {
  static override readonly eventType = EventType.BalanceChanged;
}
