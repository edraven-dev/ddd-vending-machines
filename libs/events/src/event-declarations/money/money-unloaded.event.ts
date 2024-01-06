import { CoinsAndNotes } from '@vending-machines/shared';
import { DomainEvent } from '../../lib/domain-event';

type MoneyUnloadedEventPayload = { unloadedMoney: CoinsAndNotes };

export class MoneyUnloadedEvent extends DomainEvent<MoneyUnloadedEventPayload> {}
