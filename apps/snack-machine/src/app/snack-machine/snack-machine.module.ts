import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { HeadOfficeDeletedHandler } from './head-office-deleted.handler';
import { QueryHandlers } from './queries/handlers';
import { SnackMachineController } from './snack-machine.controller';
import { SnackMachineFactory } from './snack-machine.factory';
import { SnackMachineService } from './snack-machine.service';

@Module({
  imports: [CqrsModule],
  controllers: [SnackMachineController],
  providers: [...CommandHandlers, ...QueryHandlers, SnackMachineFactory, SnackMachineService, HeadOfficeDeletedHandler],
})
export class SnackMachineModule {}
