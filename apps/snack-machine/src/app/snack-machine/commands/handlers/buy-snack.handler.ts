import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachine } from '../../snack-machine';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { BuySnackCommand } from '../impl/buy-snack.command';

@CommandHandler(BuySnackCommand)
export class BuySnackHandler implements ICommandHandler<BuySnackCommand, void> {
  constructor(
    private readonly snackMachine: SnackMachine,
    @Inject(SnackMachineRepository) private readonly snackMachineRepository: SnackMachineRepository,
  ) {}

  async execute() {
    this.snackMachine.buySnack(1);
    await this.snackMachineRepository.save(this.snackMachine);
  }
}
