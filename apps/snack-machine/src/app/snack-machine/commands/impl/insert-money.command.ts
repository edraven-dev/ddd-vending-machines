import { Money } from '../../money';

export class InsertMoneyCommand {
  constructor(public readonly money: Money) {}
}
