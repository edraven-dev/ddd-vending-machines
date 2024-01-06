import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { HeadOfficeCreatedEvent } from '@vending-machines/events';
import { HeadOffice } from './head-office';

@Injectable()
export class HeadOfficeFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id?: string): HeadOffice {
    const headOffice = this.eventPublisher.mergeObjectContext(new HeadOffice(id));
    headOffice.apply(
      new HeadOfficeCreatedEvent({ aggregateId: id, aggregateType: headOffice.constructor.name, payload: {} }),
    );
    return headOffice;
  }
}
