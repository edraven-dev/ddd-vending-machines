import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { BuySnackCommand } from '../impl/buy-snack.command';

@CommandHandler(BuySnackCommand)
export class BuySnackHandler implements ICommandHandler<BuySnackCommand, void> {
  constructor(
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id, position }: BuySnackCommand) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(id);
    if (!existingSnackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    snackMachine.buySnack(position);
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();
  }
}
