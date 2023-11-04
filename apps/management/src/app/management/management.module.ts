import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HeadOffice } from './head-office';
import { HeadOfficeRepository } from './head-office.repository.interface';
import { ManagementController } from './management.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [ManagementController],
  providers: [
    ...QueryHandlers,
    {
      provide: HeadOffice,
      useFactory: async (headOfficeRepository: HeadOfficeRepository) => await headOfficeRepository.findOne(),
      inject: [HeadOfficeRepository],
    },
  ],
})
export class ManagementModule {}
