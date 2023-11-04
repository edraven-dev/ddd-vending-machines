import { AggregateRoot, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class HeadOffice extends AggregateRoot {
  balance: Currency = new Currency(0);
  cash: Money = Money.None;

  changeBalance(delta: Currency): void {
    this.balance = this.balance.add(delta);
  }
}
