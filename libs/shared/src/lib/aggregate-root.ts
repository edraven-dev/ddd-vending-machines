import { type IEvent, WithAggregateRoot } from '@nestjs/cqrs';
import { Entity } from './entity';

export abstract class AggregateRoot<TEvent extends IEvent = IEvent> extends WithAggregateRoot(Entity)<TEvent> {
  constructor(id?: string) {
    super(id);
  }

  override async commit(dispatcherContext?: unknown): Promise<void> {
    await super.commit(dispatcherContext);
  }
}
