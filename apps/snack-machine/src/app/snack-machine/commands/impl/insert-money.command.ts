import { Money } from '@vending-machines/shared';

export class InsertMoneyCommand {
  constructor(public readonly money: Money) {}
}
