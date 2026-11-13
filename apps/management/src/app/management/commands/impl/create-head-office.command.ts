import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class CreateHeadOfficeCommand extends Command<void> {
  constructor(public readonly id: Id) {
    super();
  }
}
