import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { SnackMachineModule } from './snack-machine/snack-machine.module';

@Module({
  imports: [SnackMachineModule],
  providers: [{ provide: APP_PIPE, useValue: new ValidationPipe({ transform: true, whitelist: true }) }],
})
export class AppModule {}
