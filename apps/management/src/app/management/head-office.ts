import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { AggregateRoot, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class HeadOffice extends AggregateRoot {
  balance: Currency = new Currency(0);
  cash: Money = Money.None;

  changeBalance(delta: Currency): void {
    this.balance = this.balance.add(delta);
  }

  loadCash(cash: Money): void {
    this.cash = Money.add(this.cash, cash);
  }

  unloadCash(): Money {
    const moneyToReturn = this.cash;
    this.cash = Money.None;
    return moneyToReturn;
  }

  markAsDeleted(): void {
    this.apply(new HeadOfficeDeletedEvent({ aggregateId: this.id, aggregateType: this.constructor.name, payload: {} }));
  }
}
