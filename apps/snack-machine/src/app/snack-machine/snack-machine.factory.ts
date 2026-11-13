import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AggregateType, SnackMachineCreatedEvent } from '@vending-machines/events';
import type { Id } from '@vending-machines/shared';
import { SnackMachine } from './snack-machine';

@Injectable()
export class SnackMachineFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id: Id): SnackMachine {
    const snackMachine = this.eventPublisher.mergeObjectContext(SnackMachine.create(id));
    snackMachine.apply(
      new SnackMachineCreatedEvent({
        aggregateId: snackMachine.id,
        aggregateType: AggregateType.SnackMachine,
        payload: {},
      }),
    );
    return snackMachine;
  }
}
