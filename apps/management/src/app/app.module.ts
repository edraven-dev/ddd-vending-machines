import { Module } from '@nestjs/common';

import { InvalidOperationExceptionFilterProvider, ValidationProvider } from '@vending-machines/shared';
import { DatabaseModule } from './database/database.module';
import { ManagementModule } from './management/management.module';

@Module({
  imports: [DatabaseModule, ManagementModule],
  providers: [ValidationProvider, InvalidOperationExceptionFilterProvider],
})
export class AppModule {}
