import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AtmRepository } from '../../atm.repository.interface';
import { DeleteAtmCommand } from '../impl/delete-atm.command';

@CommandHandler(DeleteAtmCommand)
export class DeleteAtmHandler implements ICommandHandler<DeleteAtmCommand, void> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async execute({ id }: DeleteAtmCommand) {
    const existingAtm = await this.atmRepository.findOne(id);
    if (!existingAtm) {
      return;
    }

    const atm = this.eventPublisher.mergeObjectContext(existingAtm);
    atm.markAsDeleted();
    await this.atmRepository.delete(id);
    await atm.commit();
  }
}
