import { Injectable } from '@nestjs/common';
import { EventBus, IEvent, IEventPublisher } from '@nestjs/cqrs';
import * as EJSON from 'ejson';
import { AmqpService } from './amqp/amqp.service';
import { EXCHANGE_NAME } from './constants';

@Injectable()
export class EventPublisher<TEvent extends IEvent> implements IEventPublisher<TEvent> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly amqpService: AmqpService,
  ) {
    this.eventBus.publisher = this;
  }

  async publish<TEvent extends IEvent>(event: TEvent) {
    await this.amqpService.publish(EXCHANGE_NAME, `event.${event.constructor.name}`, EJSON.stringify(event), {
      persistent: true,
    });
  }
}
