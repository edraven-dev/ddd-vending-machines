import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AtmController } from './atm.controller';
import { AtmFactory } from './atm.factory';
import { AtmService } from './atm.service';
import { CommandHandlers } from './commands/handlers';
import { HeadOfficeDeletedHandler } from './head-office-deleted.handler';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [AtmController],
  providers: [...CommandHandlers, ...QueryHandlers, AtmFactory, AtmService, HeadOfficeDeletedHandler],
})
export class AtmModule {}
