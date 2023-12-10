import { Global, Module, Provider } from '@nestjs/common';
import { EventsModule } from '@vending-machines/events';
import { APP_NAME_TOKEN, InvalidOperationExceptionFilterProvider, ValidationProvider } from '@vending-machines/shared';
import { DatabaseModule } from './database/database.module';
import { ManagementModule } from './management/management.module';

const AppNameProvider: Provider = { provide: APP_NAME_TOKEN, useValue: 'Management' };

@Global()
@Module({
  imports: [DatabaseModule, EventsModule, ManagementModule],
  providers: [AppNameProvider, ValidationProvider, InvalidOperationExceptionFilterProvider],
  exports: [AppNameProvider],
})
export class AppModule {}
