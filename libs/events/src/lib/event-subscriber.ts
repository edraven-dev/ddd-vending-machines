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

type EventHandlerClass = Type<IEventHandler> & { readonly subscriptionName?: unknown };

const isDomainEventClass = (eventClass: Type<IEvent>): eventClass is DomainEventClass =>
  eventClass.prototype instanceof DomainEvent;

const subscriptionNameOf = (handlerClass: EventHandlerClass): string => {
  const { subscriptionName } = handlerClass;
  if (typeof subscriptionName !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subscriptionName)) {
    throw new Error(
      `${handlerClass.name} must declare a static kebab-case subscriptionName, got ${JSON.stringify(subscriptionName)}`,
    );
  }
  return subscriptionName;
};

@Injectable()
export class EventSubscriber implements OnApplicationBootstrap {
  constructor(
    @Inject(APP_NAME_TOKEN) private readonly appName: string,
    private readonly amqpService: AmqpService,
    private readonly explorerService: ExplorerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onApplicationBootstrap() {
    const handlerByQueue = new Map<string, EventHandlerClass>();
    for (const [eventClass, handlerClass] of this.explorerService.exploreEvents()) {
      if (!isDomainEventClass(eventClass)) {
        throw new Error(`${eventClass.name} is not a domain event`);
      }
      const { eventType } = eventClass;
      const subscriptionName = subscriptionNameOf(handlerClass);
      const queue = `q.${this.appName}.${eventType}.${subscriptionName}`;
      const otherHandlerClass = handlerByQueue.get(queue);
      if (otherHandlerClass) {
        throw new Error(
          `${this.appName} has more than one handler for ${eventType} with subscriptionName "${subscriptionName}" (${otherHandlerClass.name}, ${handlerClass.name})`,
        );
      }
      handlerByQueue.set(queue, handlerClass);
      this.subscribe(eventClass, handlerClass, queue);
    }
  }

  private subscribe(eventClass: DomainEventClass, handlerClass: Type<IEventHandler>, queue: string): void {
    const { eventType } = eventClass;
    void this.amqpService.addSubscriber(EXCHANGE_NAME, `event.${eventType}`, queue, async (msg) => {
      const decodedMessage = EJSON.parse(msg.toString('utf-8'));
      if (decodedMessage.eventType === eventType) {
        const event = Object.create(eventClass.prototype, Object.getOwnPropertyDescriptors(decodedMessage));
        await this.moduleRef.get(handlerClass, { strict: false }).handle(event);
      }
    });
  }
}
