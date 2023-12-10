import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AmqpModule } from './amqp/amqp.module';
import { EventPublisher } from './event-publisher';
import { EventSubscriber } from './event-subscriber';
import { ExplorerService } from './services/explorer.service';

@Module({
  imports: [AmqpModule.forRoot({ url: 'amqp://skyfld:skyfld-pwd@localhost' }), CqrsModule],
  providers: [EventPublisher, EventSubscriber, ExplorerService],
})
export class EventsModule {}
