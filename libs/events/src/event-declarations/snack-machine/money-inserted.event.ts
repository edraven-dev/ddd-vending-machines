import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type MoneyInsertedEventPayload = {
  insertedMoney: CoinsAndNotes;
};

export class MoneyInsertedEvent extends DomainEvent<MoneyInsertedEventPayload> {
  static override readonly eventType = EventType.MoneyInserted;
}
