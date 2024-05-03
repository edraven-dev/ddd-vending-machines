import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';

type MoneyLoadedEventPayload = { loadedMoney: CoinsAndNotes };

export class MoneyLoadedEvent extends DomainEvent<MoneyLoadedEventPayload> {}
