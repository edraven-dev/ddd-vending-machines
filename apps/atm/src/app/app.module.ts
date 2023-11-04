import { Module } from '@nestjs/common';
import { InvalidOperationExceptionFilterProvider, ValidationProvider } from '@vending-machines/shared';
import { AtmModule } from './atm/atm.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, AtmModule],
  providers: [ValidationProvider, InvalidOperationExceptionFilterProvider],
})
export class AppModule {}
