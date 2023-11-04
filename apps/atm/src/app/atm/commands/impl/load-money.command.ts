import { Money } from '@vending-machines/shared';

export class LoadMoneyCommand {
  constructor(public readonly money: Money) {}
}
