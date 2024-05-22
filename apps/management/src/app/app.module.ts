import { BullModule } from '@nestjs/bullmq';
import { Global, MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { EventsModule } from '@vending-machines/events';
import {
  APP_NAME_TOKEN,
  InvalidOperationExceptionFilterProvider,
  LoggerMiddleware,
  ValidationProvider,
} from '@vending-machines/shared';
import { BullConfig } from './config/bull.config';
import { DatabaseModule } from './database/database.module';
import { ManagementModule } from './management/management.module';

const AppNameProvider: Provider = { provide: APP_NAME_TOKEN, useValue: 'Management' };

@Global()
@Module({
  imports: [BullModule.forRootAsync({ useClass: BullConfig }), DatabaseModule, EventsModule, ManagementModule],
  providers: [AppNameProvider, ValidationProvider, InvalidOperationExceptionFilterProvider],
  exports: [AppNameProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
