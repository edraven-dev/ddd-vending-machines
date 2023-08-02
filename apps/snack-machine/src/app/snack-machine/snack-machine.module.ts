import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { SnackMachine } from './snack-machine';
import { SnackMachineController } from './snack-machine.controller';

@Module({
  imports: [CqrsModule],
  controllers: [SnackMachineController],
  providers: [SnackMachine, ...CommandHandlers, ...QueryHandlers],
})
export class SnackMachineModule {}
