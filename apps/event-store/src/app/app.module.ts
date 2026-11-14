import { Module } from '@nestjs/common';
import { AmqpModule } from '@vending-machines/events/amqp';
import { DatabaseModule } from './database/database.module';
import { EventStoreModule } from './event-store/event-store.module';

@Module({
  imports: [AmqpModule.forRoot(), DatabaseModule, EventStoreModule],
})
export class AppModule {}
