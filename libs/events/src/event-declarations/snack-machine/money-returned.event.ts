import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type MoneyReturnedEventPayload = { returnedMoney: CoinsAndNotes };

export class MoneyReturnedEvent extends DomainEvent<MoneyReturnedEventPayload> {
  static override readonly eventType = EventType.MoneyReturned;
}
