import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import Currency from 'currency.js';

export class TakeMoneyCommand extends Command<void> {
  constructor(
    public readonly id: Id,
    public readonly amount: Currency,
  ) {
    super();
  }
}
