import Currency from 'currency.js';

export class MoneyDto {
  constructor(amount: Currency) {
    this.amount = amount.intValue < 100 ? `¢${amount.cents()}` : `$${amount}`;
  }

  amount: string;
}
