import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';

type MoneyReturnedEventPayload = { returnedMoney: CoinsAndNotes };

export class MoneyReturnedEvent extends DomainEvent<MoneyReturnedEventPayload> {}
