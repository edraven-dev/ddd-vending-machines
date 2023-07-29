import { Module } from '@nestjs/common';
import { SnackMachineModule } from './snack-machine/snack-machine.module';

@Module({
  imports: [SnackMachineModule],
})
export class AppModule {}
