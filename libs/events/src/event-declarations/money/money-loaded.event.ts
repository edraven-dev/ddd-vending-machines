import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type MoneyLoadedEventPayload = { loadedMoney: CoinsAndNotes };

export class MoneyLoadedEvent extends DomainEvent<MoneyLoadedEventPayload> {
  static override readonly eventType = EventType.MoneyLoaded;
}
