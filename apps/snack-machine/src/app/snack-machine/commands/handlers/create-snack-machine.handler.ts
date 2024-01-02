import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachineCreatedEvent } from '@vending-machines/events';
import Currency from 'currency.js';
import { Snack } from '../../../snack/snack';
import { SnackMachine } from '../../snack-machine';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { SnackPile } from '../../snack-pile';
import { CreateSnackMachineCommand } from '../impl/create-snack-machine.command';

@CommandHandler(CreateSnackMachineCommand)
export class CreateSnackMachineHandler implements ICommandHandler<CreateSnackMachineCommand, void> {
  constructor(
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: CreateSnackMachineCommand) {
    const snackMachine = this.eventPublisher.mergeObjectContext(new SnackMachine(id));
    snackMachine.apply(
      new SnackMachineCreatedEvent({ aggregateId: id, aggregateType: snackMachine.constructor.name, payload: {} }),
    );
    snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency('3.00')));
    snackMachine.loadSnacks(2, new SnackPile(Snack.Soda, 10, new Currency('2.00')));
    snackMachine.loadSnacks(3, new SnackPile(Snack.Gum, 10, new Currency('1.00')));
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();
  }
}
