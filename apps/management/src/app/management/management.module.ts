import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BalanceChangedHandler } from './balance-changed.handler';
import { HeadOffice } from './head-office';
import { HeadOfficeRepository } from './head-office.repository.interface';
import { ManagementController } from './management.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [ManagementController],
  providers: [
    BalanceChangedHandler,
    ...QueryHandlers,
    {
      provide: HeadOffice,
      useFactory: async (headOfficeRepository: HeadOfficeRepository) => await headOfficeRepository.findOne(),
      inject: [HeadOfficeRepository],
    },
  ],
})
export class ManagementModule {}
