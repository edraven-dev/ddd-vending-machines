/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { EntityMixin } from './entity';

export const AggregateRoot = EntityMixin(NestAggregateRoot);
