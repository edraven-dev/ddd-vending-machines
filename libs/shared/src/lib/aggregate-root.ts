import { type IEvent, WithAggregateRoot } from '@nestjs/cqrs';
import { Entity } from './entity';
import type { Id } from './id';

export abstract class AggregateRoot<TEvent extends IEvent = IEvent> extends WithAggregateRoot(Entity)<TEvent> {
  constructor(id: Id) {
    super(id);
  }

  override async commit(dispatcherContext?: unknown): Promise<void> {
    await super.commit(dispatcherContext);
  }
}
