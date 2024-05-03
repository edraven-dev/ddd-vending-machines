import { Money } from '@vending-machines/shared';

export class InsertMoneyCommand {
  constructor(
    public readonly id: string,
    public readonly money: Money,
  ) {}
}
