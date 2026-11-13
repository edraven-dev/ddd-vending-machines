import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class CreateSnackMachineCommand extends Command<void> {
  constructor(public readonly id: Id) {
    super();
  }
}
