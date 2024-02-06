import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { SnackMachineCreatedEvent } from '@vending-machines/events';
import { SnackMachine } from './snack-machine';

@Injectable()
export class SnackMachineFactory {
  constructor(private readonly eventPublisher: EventPublisher) {}

  create(id?: string): SnackMachine {
    const snackMachine = this.eventPublisher.mergeObjectContext(new SnackMachine(id));
    snackMachine.apply(
      new SnackMachineCreatedEvent({
        aggregateId: snackMachine.id,
        aggregateType: snackMachine.constructor.name,
        payload: {},
      }),
    );
    return snackMachine;
  }
}
