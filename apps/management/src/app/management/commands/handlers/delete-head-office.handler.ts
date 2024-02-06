import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { DeleteHeadOfficeCommand } from '../impl/delete-head-office.command';

@CommandHandler(DeleteHeadOfficeCommand)
export class DeleteHeadOfficeHandler implements ICommandHandler<DeleteHeadOfficeCommand, void> {
  constructor(
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id }: DeleteHeadOfficeCommand) {
    const existingHeadOffice = await this.headOfficeRepository.findOne(id);
    if (!existingHeadOffice) {
      throw new NotFoundException(`Head office with id ${id} not found`);
    }

    const headOffice = this.eventPublisher.mergeObjectContext(existingHeadOffice);
    headOffice.markAsDeleted();
    await this.headOfficeRepository.delete(id);
    headOffice.commit();
  }
}
