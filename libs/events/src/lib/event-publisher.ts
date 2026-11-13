import { Injectable } from '@nestjs/common';
import { EventBus, IEvent, IEventPublisher } from '@nestjs/cqrs';
import { EJSON } from 'bson';
import { AmqpService } from './amqp/amqp.service';
import { EXCHANGE_NAME } from './constants';
import { DomainEvent } from './domain-event';

@Injectable()
export class EventPublisher<TEvent extends IEvent> implements IEventPublisher<TEvent> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly amqpService: AmqpService,
  ) {
    this.eventBus.publisher = this;
  }

  async publish<TEvent extends IEvent>(event: TEvent) {
    if (!(event instanceof DomainEvent)) {
      throw new Error(`${event.constructor.name} is not a domain event`);
    }
    await this.amqpService.publish(EXCHANGE_NAME, `event.${event.eventType}`, EJSON.stringify(event), {
      persistent: true,
      messageId: event.eventId,
    });
  }

  async publishAll<TEvent extends IEvent>(events: TEvent[]): Promise<void> {
    const snapshot = [...events];
    for (const event of snapshot) {
      await this.publish(event);
    }
  }
}
