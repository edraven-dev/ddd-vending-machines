import { Inject, Injectable, OnApplicationBootstrap, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IEvent, IEventHandler } from '@nestjs/cqrs';
import { APP_NAME_TOKEN } from '@vending-machines/shared';
import { plainToInstance } from 'class-transformer';
import * as EJSON from 'ejson';
import { AmqpService } from './amqp/amqp.service';
import { EXCHANGE_NAME } from './constants';
import { ExplorerService } from './services/explorer.service';

@Injectable()
export class EventSubscriber implements OnApplicationBootstrap {
  constructor(
    @Inject(APP_NAME_TOKEN) private readonly appName: string,
    private readonly amqpService: AmqpService,
    private readonly explorerService: ExplorerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onApplicationBootstrap() {
    const events = this.explorerService.exploreEvents();
    events.forEach(this.subscribe.bind(this));
  }

  private subscribe([moduleName, EventType, EventHandler]: [string, Type<IEvent>, Type<IEventHandler>]): void {
    this.amqpService.addSubscriber(
      EXCHANGE_NAME,
      `#.${EventType.name}.#`,
      `q.${this.appName}.${moduleName}.${EventType.name}.${EventHandler.name}`,
      async (msg) => {
        const decodedMessage = EJSON.parse(msg.toString('utf-8'));
        if (EventType.name === decodedMessage.type) {
          const eventInstance = plainToInstance(EventType, decodedMessage.payload);
          await this.moduleRef.get(EventHandler, { strict: false }).handle(eventInstance);
        }
      },
    );
  }
}
