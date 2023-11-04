import { AggregateRoot, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class HeadOffice extends AggregateRoot {
  balance: Currency;
  cash: Money;
}
