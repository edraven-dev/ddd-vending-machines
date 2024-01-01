import Currency from 'currency.js';

export class TakeMoneyCommand {
  constructor(
    public readonly id: string,
    public readonly amount: Currency,
  ) {}
}
