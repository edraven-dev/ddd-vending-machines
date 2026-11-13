import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext, Transactional } from '@mikro-orm/decorators/legacy';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BalanceChangedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOfficeRepository } from './head-office.repository.interface';
import { Inbox } from './inbox.interface';

@EventsHandler(BalanceChangedEvent)
export class BalanceChangedHandler implements IEventHandler<BalanceChangedEvent> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext() and @Transactional()
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly inbox: Inbox,
  ) {}

  @CreateRequestContext()
  @Transactional()
  async handle(event: BalanceChangedEvent) {
    if (!(await this.inbox.tryRecord(BalanceChangedHandler.name, event.eventId))) {
      return;
    }

    const headOffice = await this.headOfficeRepository.findOne(Id.from(event.aggregateId));

    if (!headOffice) {
      Logger.error(`Head office with id ${event.aggregateId} not found`, this.constructor.name);
      return;
    }

    headOffice.changeBalance(new Currency(event.payload.delta));
    await this.headOfficeRepository.save(headOffice);
  }
}
