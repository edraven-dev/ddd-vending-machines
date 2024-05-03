import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { ReturnMoneyCommand } from '../impl/return-money.command';

@CommandHandler(ReturnMoneyCommand)
export class ReturnMoneyHandler implements ICommandHandler<ReturnMoneyCommand, void> {
  constructor(
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: ReturnMoneyCommand) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(id);
    if (!existingSnackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    snackMachine.returnMoney();
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();
  }
}
