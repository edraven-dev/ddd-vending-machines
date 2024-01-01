import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { BuySnackCommand } from '../impl/buy-snack.command';

@CommandHandler(BuySnackCommand)
export class BuySnackHandler implements ICommandHandler<BuySnackCommand, void> {
  constructor(private readonly snackMachineRepository: SnackMachineRepository) {}

  async execute({ id, position }: BuySnackCommand) {
    const snackMachine = await this.snackMachineRepository.findOne(id);

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    snackMachine.buySnack(position);
    await this.snackMachineRepository.save(snackMachine);
  }
}
