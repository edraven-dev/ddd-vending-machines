import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { HeadOfficeCreatedEvent } from '@vending-machines/events';
import { HeadOffice } from '../../head-office';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { CreateHeadOfficeCommand } from '../impl/create-head-office.command';

@CommandHandler(CreateHeadOfficeCommand)
export class CreateHeadOfficeHandler implements ICommandHandler<CreateHeadOfficeCommand, void> {
  constructor(
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: CreateHeadOfficeCommand) {
    const headOffice = this.eventPublisher.mergeObjectContext(new HeadOffice(id));
    headOffice.apply(
      new HeadOfficeCreatedEvent({ aggregateId: id, aggregateType: headOffice.constructor.name, payload: {} }),
    );
    await this.headOfficeRepository.save(headOffice);
    headOffice.commit();
  }
}
