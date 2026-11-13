import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class BuySnackCommand extends Command<void> {
  constructor(
    public readonly id: Id,
    public readonly position: number,
  ) {
    super();
  }
}
