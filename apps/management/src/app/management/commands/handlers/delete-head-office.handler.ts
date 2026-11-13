import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { allSettledOrThrow } from '../../all-settled-or-throw';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { AtmProtoServiceClient } from '../../proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from '../../proto-clients/snack-machine-proto-service.client';
import { DeleteHeadOfficeCommand } from '../impl/delete-head-office.command';

@CommandHandler(DeleteHeadOfficeCommand)
export class DeleteHeadOfficeHandler implements ICommandHandler<DeleteHeadOfficeCommand, void> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly atmProtoServiceClient: AtmProtoServiceClient,
    private readonly snackMachineProtoServiceClient: SnackMachineProtoServiceClient,
  ) {}

  @CreateRequestContext()
  async execute({ id }: DeleteHeadOfficeCommand) {
    const existingHeadOffice = await this.headOfficeRepository.findOne(id);
    if (!existingHeadOffice) {
      throw new NotFoundException(`Head office with id ${id.value} not found`);
    }

    await allSettledOrThrow([
      ...existingHeadOffice.atmIds.map((atmId) => this.atmProtoServiceClient.deleteAtm(atmId.value)),
      ...existingHeadOffice.snackMachineIds.map((snackMachineId) =>
        this.snackMachineProtoServiceClient.deleteSnackMachine(snackMachineId.value),
      ),
    ]);

    const headOffice = this.eventPublisher.mergeObjectContext(existingHeadOffice);
    headOffice.delete();
    await this.headOfficeRepository.delete(id);
    await headOffice.commit();
  }
}
