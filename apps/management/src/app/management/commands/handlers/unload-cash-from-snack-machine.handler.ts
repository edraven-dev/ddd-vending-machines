import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { SnackMachineProtoServiceClient } from '../../proto-clients/snack-machine-proto-service.client';
import { UnloadCashFromSnackMachineCommand } from '../impl/unload-cash-from-snack-machine.command';

@CommandHandler(UnloadCashFromSnackMachineCommand)
export class UnloadCashFromSnackMachineHandler implements ICommandHandler<UnloadCashFromSnackMachineCommand, void> {
  constructor(
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly snackMachineProtoServiceClient: SnackMachineProtoServiceClient,
  ) {}

  async execute({ id }: UnloadCashFromSnackMachineCommand) {
    const headOffice = await this.headOfficeRepository.findOne(id);

    if (!headOffice) {
      throw new NotFoundException(`Head office with id ${id} not found`);
    }

    const cash = await this.snackMachineProtoServiceClient.unloadMoney(id);
    headOffice.loadCash(new Money(...cash.money));
    await this.headOfficeRepository.save(headOffice);
  }
}
