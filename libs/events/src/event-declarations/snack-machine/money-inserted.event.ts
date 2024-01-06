import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';

type MoneyInsertedEventPayload = {
  insertedMoney: CoinsAndNotes;
};

export class MoneyInsertedEvent extends DomainEvent<MoneyInsertedEventPayload> {}
