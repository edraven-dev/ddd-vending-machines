import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { ReturnMoneyCommand } from '../impl/return-money.command';

@CommandHandler(ReturnMoneyCommand)
export class ReturnMoneyHandler implements ICommandHandler<ReturnMoneyCommand, void> {
  constructor(private readonly snackMachineRepository: SnackMachineRepository) {}

  async execute({ id }: ReturnMoneyCommand) {
    const snackMachine = await this.snackMachineRepository.findOne(id);

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    snackMachine.returnMoney();
    await this.snackMachineRepository.save(snackMachine);
  }
}
