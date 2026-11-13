import { Command } from '@nestjs/cqrs';
import type { Id, Money } from '@vending-machines/shared';

export class InsertMoneyCommand extends Command<void> {
  constructor(
    public readonly id: Id,
    public readonly money: Money,
  ) {
    super();
  }
}
