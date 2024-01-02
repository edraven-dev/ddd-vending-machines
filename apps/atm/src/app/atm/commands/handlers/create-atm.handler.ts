import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AtmCreatedEvent } from '@vending-machines/events';
import { Atm } from '../../atm';
import { AtmRepository } from '../../atm.repository.interface';
import { CreateAtmCommand } from '../impl/create-atm.command';

@CommandHandler(CreateAtmCommand)
export class CreateAtmHandler implements ICommandHandler<CreateAtmCommand, void> {
  constructor(
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: CreateAtmCommand) {
    const atm = this.eventPublisher.mergeObjectContext(new Atm(id));
    atm.apply(new AtmCreatedEvent({ aggregateId: id, aggregateType: atm.constructor.name, payload: {} }));
    await this.atmRepository.save(atm);
    atm.commit();
  }
}
