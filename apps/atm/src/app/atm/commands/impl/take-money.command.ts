import Currency from 'currency.js';

export class TakeMoneyCommand {
  constructor(public readonly amount: Currency) {}
}
