import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { EventPublisher, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { AtmRepository } from './atm.repository.interface';

@EventsHandler(HeadOfficeDeletedEvent)
export class HeadOfficeDeletedHandler implements IEventHandler<HeadOfficeDeletedEvent> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async handle(event: HeadOfficeDeletedEvent) {
    const existingAtm = await this.atmRepository.findOne(event.aggregateId);
    if (!existingAtm) {
      Logger.error(`Head office with id ${event.aggregateId} not found`, this.constructor.name);
      return;
    }

    const atm = this.eventPublisher.mergeObjectContext(existingAtm);
    atm.markAsDeleted();
    await this.atmRepository.delete(atm.id);
    atm.commit();
  }
}
