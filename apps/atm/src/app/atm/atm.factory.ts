import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AtmCreatedEvent } from '@vending-machines/events';
import { Atm } from './atm';

@Injectable()
export class AtmFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id?: string): Atm {
    const atm = this.eventPublisher.mergeObjectContext(new Atm(id));
    atm.apply(new AtmCreatedEvent({ aggregateId: atm.id, aggregateType: atm.constructor.name, payload: {} }));
    return atm;
  }
}
