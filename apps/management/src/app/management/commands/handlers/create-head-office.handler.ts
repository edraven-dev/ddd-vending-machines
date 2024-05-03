import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HeadOfficeFactory } from '../../head-office.factory';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { CreateHeadOfficeCommand } from '../impl/create-head-office.command';

@CommandHandler(CreateHeadOfficeCommand)
export class CreateHeadOfficeHandler implements ICommandHandler<CreateHeadOfficeCommand, void> {
  constructor(
    private readonly headOfficeFactory: HeadOfficeFactory,
    private readonly headOfficeRepository: HeadOfficeRepository,
  ) {}

  async execute({ id }: CreateHeadOfficeCommand) {
    const headOffice = this.headOfficeFactory.create(id);
    await this.headOfficeRepository.save(headOffice);
    headOffice.commit();
  }
}
