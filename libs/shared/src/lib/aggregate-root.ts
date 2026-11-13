import { type IEvent, WithAggregateRoot } from '@nestjs/cqrs';
import { Entity } from './entity';
import type { Id } from './id';

export abstract class AggregateRoot<
  TId extends Id | string = Id,
  TEvent extends IEvent = IEvent,
> extends WithAggregateRoot(Entity)<TEvent> {
  declare readonly id: TId;

  constructor(id: TId) {
    super(id);
  }

  override async commit(dispatcherContext?: unknown): Promise<void> {
    await super.commit(dispatcherContext);
  }
}
