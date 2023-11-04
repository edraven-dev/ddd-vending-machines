import { Module } from '@nestjs/common';

import { InvalidOperationExceptionFilterProvider, ValidationProvider } from '@vending-machines/shared';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ValidationProvider, InvalidOperationExceptionFilterProvider],
})
export class AppModule {}
