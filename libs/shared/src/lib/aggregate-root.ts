import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { DEFAULT_ID } from './constants';
import { EntityMixin } from './entity';

class IdentifiableNestAggregateRoot extends NestAggregateRoot {
  readonly id: string;

  constructor(id?: string) {
    super();
    this.id = id || DEFAULT_ID;
  }
}

export const AggregateRoot = EntityMixin(IdentifiableNestAggregateRoot);
