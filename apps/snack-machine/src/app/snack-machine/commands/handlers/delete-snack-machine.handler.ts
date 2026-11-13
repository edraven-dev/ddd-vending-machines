import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { DeleteSnackMachineCommand } from '../impl/delete-snack-machine.command';

@CommandHandler(DeleteSnackMachineCommand)
export class DeleteSnackMachineHandler implements ICommandHandler<DeleteSnackMachineCommand, void> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async execute({ id }: DeleteSnackMachineCommand) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(id);
    if (!existingSnackMachine) {
      return;
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    snackMachine.markAsDeleted();
    await this.snackMachineRepository.delete(id);
    await snackMachine.commit();
  }
}
