import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BalanceChangedEvent } from '@vending-machines/events';
import Currency from 'currency.js';
import { HeadOfficeRepository } from './head-office.repository.interface';

@EventsHandler(BalanceChangedEvent)
export class BalanceChangedHandler implements IEventHandler<BalanceChangedEvent> {
  constructor(private readonly headOfficeRepository: HeadOfficeRepository) {}

  async handle(event: BalanceChangedEvent) {
    const headOffice = await this.headOfficeRepository.findOne(event.aggregateId);

    if (!headOffice) {
      Logger.error(`Head office with id ${event.aggregateId} not found`, this.constructor.name);
      return;
    }

    headOffice.changeBalance(new Currency(event.payload.delta));
    await this.headOfficeRepository.save(headOffice);
  }
}
