import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AggregateType, HeadOfficeCreatedEvent } from '@vending-machines/events';
import type { Id } from '@vending-machines/shared';
import { HeadOffice } from './head-office';

@Injectable()
export class HeadOfficeFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id: Id): HeadOffice {
    const headOffice = this.eventPublisher.mergeObjectContext(new HeadOffice(id));
    headOffice.apply(
      new HeadOfficeCreatedEvent({
        aggregateId: headOffice.id,
        aggregateType: AggregateType.HeadOffice,
        payload: {},
      }),
    );
    return headOffice;
  }
}
