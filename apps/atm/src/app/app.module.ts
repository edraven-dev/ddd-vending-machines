import { Global, MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { EventsModule } from '@vending-machines/events';
import {
  APP_NAME_TOKEN,
  InvalidOperationExceptionFilterProvider,
  LoggerMiddleware,
  ValidationProvider,
} from '@vending-machines/shared';
import { AtmModule } from './atm/atm.module';
import { DatabaseModule } from './database/database.module';

const AppNameProvider: Provider = { provide: APP_NAME_TOKEN, useValue: 'ATM' };

@Global()
@Module({
  imports: [DatabaseModule, EventsModule, AtmModule],
  providers: [AppNameProvider, ValidationProvider, InvalidOperationExceptionFilterProvider],
  exports: [AppNameProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
