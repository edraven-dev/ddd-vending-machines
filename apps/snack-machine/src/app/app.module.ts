import { Module } from '@nestjs/common';
import { ValidationProvider } from '@vending-machines/shared';
import { SnackMachineModule } from './snack-machine/snack-machine.module';

@Module({
  imports: [SnackMachineModule],
  providers: [ValidationProvider],
})
export class AppModule {}
