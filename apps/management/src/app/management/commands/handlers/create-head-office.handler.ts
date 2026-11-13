import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { allSettledOrThrow } from '../../all-settled-or-throw';
import type { HeadOffice } from '../../head-office';
import { HeadOfficeFactory } from '../../head-office.factory';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { AtmProtoServiceClient } from '../../proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from '../../proto-clients/snack-machine-proto-service.client';
import { CreateHeadOfficeCommand } from '../impl/create-head-office.command';

@CommandHandler(CreateHeadOfficeCommand)
export class CreateHeadOfficeHandler implements ICommandHandler<CreateHeadOfficeCommand, void> {
  constructor(
    private readonly headOfficeFactory: HeadOfficeFactory,
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly atmProtoServiceClient: AtmProtoServiceClient,
    private readonly snackMachineProtoServiceClient: SnackMachineProtoServiceClient,
  ) {}

  async execute({ id, atmId, snackMachineId }: CreateHeadOfficeCommand) {
    const headOffice = this.headOfficeFactory.create(id, [atmId], [snackMachineId]);
    await this.headOfficeRepository.save(headOffice);
    await headOffice.commit();

    try {
      await allSettledOrThrow([
        this.atmProtoServiceClient.createAtm(atmId.value),
        this.snackMachineProtoServiceClient.createSnackMachine(snackMachineId.value),
      ]);
    } catch (error) {
      await this.expireAndRethrow(headOffice, error);
    }
  }

  private async expireAndRethrow(headOffice: HeadOffice, error: unknown): Promise<never> {
    headOffice.expire();
    await this.headOfficeRepository.save(headOffice);
    throw error;
  }
}
