import Currency from 'currency.js';

export class MoneyDto {
  readonly amount: string;

  constructor(amount: Currency) {
    this.amount = amount.intValue < 100 ? `¢${amount.cents()}` : amount.format();
  }
}
