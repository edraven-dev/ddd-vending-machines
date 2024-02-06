import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { LoadSnacksCommand } from '../impl/load-snacks.command';

@CommandHandler(LoadSnacksCommand)
export class LoadSnacksHandler implements ICommandHandler<LoadSnacksCommand, void> {
  constructor(
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id, position, quantity }: LoadSnacksCommand) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(id);
    if (!existingSnackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    const snackPile = snackMachine.getSnackPile(position);
    snackMachine.loadSnacks(position, snackPile.addQuantity(quantity));
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();
  }
}
