import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AggregateType, HeadOfficeCreatedEvent } from '@vending-machines/events';
import type { Id } from '@vending-machines/shared';
import { HeadOffice } from './head-office';

const LIFETIME_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class HeadOfficeFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id: Id, atmIds: readonly Id[], snackMachineIds: readonly Id[]): HeadOffice {
    const expiresAt = new Date(Date.now() + LIFETIME_IN_MS);
    const headOffice = this.eventPublisher.mergeObjectContext(new HeadOffice(id, atmIds, snackMachineIds, expiresAt));
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
