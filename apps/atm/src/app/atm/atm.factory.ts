import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AggregateType, AtmCreatedEvent } from '@vending-machines/events';
import type { Id } from '@vending-machines/shared';
import { Atm } from './atm';

@Injectable()
export class AtmFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id: Id): Atm {
    const atm = this.eventPublisher.mergeObjectContext(new Atm(id));
    atm.apply(new AtmCreatedEvent({ aggregateId: atm.id, aggregateType: AggregateType.Atm, payload: {} }));
    return atm;
  }
}
