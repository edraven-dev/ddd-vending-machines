import { Module } from '@nestjs/common';
import { AmqpModule } from '../amqp/amqp.module';
import { DatabaseModule } from '../database/database.module';
import { EventStoreService } from './event-store.service';

@Module({
  imports: [AmqpModule.forRoot({ url: process.env['RABBITMQ_URL'] || 'amqp://localhost' }), DatabaseModule],
  providers: [EventStoreService],
})
export class EventStoreModule {}
