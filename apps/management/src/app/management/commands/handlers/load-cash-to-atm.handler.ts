import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { AtmProtoServiceClient } from '../../proto-clients/atm-proto-service.client';
import { LoadCashToAtmCommand } from '../impl/load-cash-to-atm.command';

@CommandHandler(LoadCashToAtmCommand)
export class LoadCashToAtmHandler implements ICommandHandler<LoadCashToAtmCommand, void> {
  constructor(
    @Inject(HeadOfficeRepository) private readonly headOfficeRepository: HeadOfficeRepository,
    private readonly atmProtoServiceClient: AtmProtoServiceClient,
  ) {}

  async execute() {
    const headOffice = await this.headOfficeRepository.findOne();
    const cash = headOffice.unloadCash();
    await this.atmProtoServiceClient.loadMoney({
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
