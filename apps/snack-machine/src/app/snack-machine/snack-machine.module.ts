import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { SnackMachineController } from './snack-machine.controller';
import { SnackMachineService } from './snack-machine.service';

@Module({
  imports: [CqrsModule],
  controllers: [SnackMachineController],
  providers: [...CommandHandlers, ...QueryHandlers, SnackMachineService],
})
export class SnackMachineModule {}
