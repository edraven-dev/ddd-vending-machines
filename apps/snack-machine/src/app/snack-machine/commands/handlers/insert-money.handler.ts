import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { InsertMoneyCommand } from '../impl/insert-money.command';

@CommandHandler(InsertMoneyCommand)
export class InsertMoneyHandler implements ICommandHandler<InsertMoneyCommand, void> {
  constructor(
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id, money }: InsertMoneyCommand) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(id);
    if (!existingSnackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    snackMachine.insertMoney(money);
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();
  }
}
