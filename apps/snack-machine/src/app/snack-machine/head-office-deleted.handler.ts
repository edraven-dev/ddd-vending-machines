import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { Logger } from '@nestjs/common';
import { EventPublisher, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { SnackMachineRepository } from './snack-machine.repository.interface';

@EventsHandler(HeadOfficeDeletedEvent)
export class HeadOfficeDeletedHandler implements IEventHandler<HeadOfficeDeletedEvent> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async handle(event: HeadOfficeDeletedEvent) {
    const existingSnackMachine = await this.snackMachineRepository.findOne(Id.from(event.aggregateId));
    if (!existingSnackMachine) {
      Logger.error(`Head office with id ${event.aggregateId} not found`, this.constructor.name);
      return;
    }

    const snackMachine = this.eventPublisher.mergeObjectContext(existingSnackMachine);
    snackMachine.markAsDeleted();
    await this.snackMachineRepository.delete(snackMachine.id);
    await snackMachine.commit();
  }
}
