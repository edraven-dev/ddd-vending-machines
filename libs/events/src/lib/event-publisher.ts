import { Injectable } from '@nestjs/common';
import { EventBus, IEvent, IEventPublisher } from '@nestjs/cqrs';
import * as EJSON from 'ejson';
import { AmqpService } from './amqp/amqp.service';
import { EXCHANGE_NAME } from './constants';

type EventMessage = { type: string; payload: IEvent };

@Injectable()
export class EventPublisher<EventBase extends IEvent> implements IEventPublisher<EventBase> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly amqpService: AmqpService,
  ) {
    this.eventBus.publisher = this;
  }

  async publish<TEvent extends IEvent>(event: TEvent) {
    const eventMessage: EventMessage = { type: event.constructor.name, payload: event };
    await this.amqpService.publish(EXCHANGE_NAME, `event.${event.constructor.name}`, EJSON.stringify(eventMessage), {
      persistent: true,
    });
  }
}
