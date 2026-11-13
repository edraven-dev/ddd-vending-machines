import { Command } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';

export class UnloadCashFromSnackMachineCommand extends Command<void> {
  constructor(
    public readonly id: Id,
    public readonly snackMachineId: Id,
  ) {
    super();
  }
}
