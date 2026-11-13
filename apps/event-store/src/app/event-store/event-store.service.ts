import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EJSON } from 'bson';
import { AmqpService } from '../amqp/amqp.service';
import { EXCHANGE_NAME } from '../constants';
import { EventStoreRepository } from './event-store.repository.interface';

@Injectable()
export class EventStoreService implements OnApplicationBootstrap {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly amqpService: AmqpService,
    private readonly eventStoreRepository: EventStoreRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.storeEvents();
  }

  async storeEvents() {
    const routingKey = 'event.#';
    const queue = 'q.EventStore';

    await this.amqpService.addSubscriber(EXCHANGE_NAME, routingKey, queue, (msg) => this.storeEvent(msg));
  }

  @CreateRequestContext()
  async storeEvent(msg: Buffer): Promise<void> {
    await this.eventStoreRepository.save(EJSON.parse(msg.toString('utf-8')));
  }
}
