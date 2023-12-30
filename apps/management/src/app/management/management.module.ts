import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BalanceChangedHandler } from './balance-changed.handler';
import { CommandHandlers } from './commands/handlers';
import { HeadOffice } from './head-office';
import { HeadOfficeRepository } from './head-office.repository.interface';
import { ManagementController } from './management.controller';
import { AtmProtoServiceClient } from './proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from './proto-clients/snack-machine-proto-service.client';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [ManagementController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    AtmProtoServiceClient,
    SnackMachineProtoServiceClient,
    BalanceChangedHandler,
    {
      provide: HeadOffice,
      useFactory: async (headOfficeRepository: HeadOfficeRepository) => await headOfficeRepository.findOne(),
      inject: [HeadOfficeRepository],
    },
  ],
})
export class ManagementModule {}
