import { Module } from '@nestjs/common';
import { InvalidOperationExceptionFilterProvider, ValidationProvider } from '@vending-machines/shared';
import { DatabaseModule } from './database/database.module';
import { SnackMachineModule } from './snack-machine/snack-machine.module';

@Module({
  imports: [DatabaseModule, SnackMachineModule],
  providers: [ValidationProvider, InvalidOperationExceptionFilterProvider],
})
export class AppModule {}
