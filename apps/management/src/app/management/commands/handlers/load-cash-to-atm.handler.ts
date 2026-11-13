import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { AtmProtoServiceClient } from '../../proto-clients/atm-proto-service.client';
import { LoadCashToAtmCommand } from '../impl/load-cash-to-atm.command';

@CommandHandler(LoadCashToAtmCommand)
export class LoadCashToAtmHandler implements ICommandHandler<LoadCashToAtmCommand, void> {
  constructor(
    private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly atmProtoServiceClient: AtmProtoServiceClient,
  ) {}

  async execute({ id, atmId }: LoadCashToAtmCommand) {
    const headOffice = await this.headOfficeRepository.findOne(id);

    if (!headOffice) {
      throw new NotFoundException(`Head office with id ${id.value} not found`);
    }
    if (!headOffice.hasAtm(atmId)) {
      throw new NotFoundException(`Atm with id ${atmId.value} not found in head office ${id.value}`);
    }

    const cash = headOffice.unloadCash();
    await this.atmProtoServiceClient.loadMoney({
      id: atmId.value,
      money: [
        cash.oneCentCount,
        cash.tenCentCount,
        cash.quarterCount,
        cash.oneDollarCount,
        cash.fiveDollarCount,
        cash.twentyDollarCount,
      ],
    });
    await this.headOfficeRepository.save(headOffice);
  }
}
