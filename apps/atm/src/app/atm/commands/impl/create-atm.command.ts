import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class CreateAtmCommand extends Command<void> {
  constructor(public readonly id: Id) {
    super();
  }
}
