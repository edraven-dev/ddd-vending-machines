import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { SnackMachineProtoServiceClient } from '../../proto-clients/snack-machine-proto-service.client';
import { UnloadCashFromSnackMachineCommand } from '../impl/unload-cash-from-snack-machine.command';

@CommandHandler(UnloadCashFromSnackMachineCommand)
export class UnloadCashFromSnackMachineHandler implements ICommandHandler<UnloadCashFromSnackMachineCommand, void> {
  constructor(
    @Inject(HeadOfficeRepository) private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly snackMachineProtoServiceClient: SnackMachineProtoServiceClient,
  ) {}

  async execute() {
    const headOffice = await this.headOfficeRepository.findOne();
    const cash = await this.snackMachineProtoServiceClient.unloadMoney();
    headOffice.loadCash(new Money(...cash.money));
    await this.headOfficeRepository.save(headOffice);
  }
}
