import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { SnackMachine } from './snack-machine';
import { SnackMachineController } from './snack-machine.controller';
import { SnackMachineRepository } from './snack-machine.repository.interface';
import { SnackMachineService } from './snack-machine.service';

@Module({
  imports: [CqrsModule],
  controllers: [SnackMachineController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    SnackMachineService,
    {
      provide: SnackMachine,
      useFactory: async (snackMachineRepository: SnackMachineRepository) => await snackMachineRepository.findOne(),
      inject: [SnackMachineRepository],
    },
  ],
})
export class SnackMachineModule {}
