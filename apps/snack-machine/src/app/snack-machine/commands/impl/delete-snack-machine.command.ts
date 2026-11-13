import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class DeleteSnackMachineCommand extends Command<void> {
  constructor(public readonly id: Id) {
    super();
  }
}
