import { Inject, Injectable, OnApplicationBootstrap, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IEvent, IEventHandler } from '@nestjs/cqrs';
import { APP_NAME_TOKEN } from '@vending-machines/shared';
import { EJSON } from 'bson';
import { AmqpService } from './amqp/amqp.service';
import { EXCHANGE_NAME } from './constants';
import { DomainEvent } from './domain-event';
import type { EventType } from './event-type';
import { ExplorerService } from './services/explorer.service';

type DomainEventClass = Type<DomainEvent<Record<string, unknown>>> & { readonly eventType: EventType };

const isDomainEventClass = (eventClass: Type<IEvent>): eventClass is DomainEventClass =>
  eventClass.prototype instanceof DomainEvent;

@Injectable()
export class EventSubscriber implements OnApplicationBootstrap {
  constructor(
    @Inject(APP_NAME_TOKEN) private readonly appName: string,
    private readonly amqpService: AmqpService,
    private readonly explorerService: ExplorerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onApplicationBootstrap() {
    const subscribed = new Set<EventType>();
    for (const [eventClass, handlerClass] of this.explorerService.exploreEvents()) {
      if (!isDomainEventClass(eventClass)) {
        throw new Error(`${eventClass.name} is not a domain event`);
      }
      if (subscribed.has(eventClass.eventType)) {
        throw new Error(`${this.appName} has more than one handler for ${eventClass.eventType}`);
      }
      subscribed.add(eventClass.eventType);
      this.subscribe(eventClass, handlerClass);
    }
  }

  private subscribe(eventClass: DomainEventClass, handlerClass: Type<IEventHandler>): void {
    const { eventType } = eventClass;
    void this.amqpService.addSubscriber(
      EXCHANGE_NAME,
      `event.${eventType}`,
      `q.${this.appName}.${eventType}`,
      async (msg) => {
        const decodedMessage = EJSON.parse(msg.toString('utf-8'));
        if (decodedMessage.eventType === eventType) {
          const event = Object.create(eventClass.prototype, Object.getOwnPropertyDescriptors(decodedMessage));
          await this.moduleRef.get(handlerClass, { strict: false }).handle(event);
        }
      },
    );
  }
}
