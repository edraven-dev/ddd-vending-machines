import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { InsertMoneyCommand } from '../impl/insert-money.command';

@CommandHandler(InsertMoneyCommand)
export class InsertMoneyHandler implements ICommandHandler<InsertMoneyCommand, void> {
  constructor(private readonly snackMachineRepository: SnackMachineRepository) {}

  async execute({ id, money }: InsertMoneyCommand) {
    const snackMachine = await this.snackMachineRepository.findOne(id);

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    snackMachine.insertMoney(money);
    await this.snackMachineRepository.save(snackMachine);
  }
}
