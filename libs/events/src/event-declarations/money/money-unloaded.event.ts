import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type MoneyUnloadedEventPayload = { unloadedMoney: CoinsAndNotes };

export class MoneyUnloadedEvent extends DomainEvent<MoneyUnloadedEventPayload> {
  static override readonly eventType = EventType.MoneyUnloaded;
}
