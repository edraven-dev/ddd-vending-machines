/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { Entity } from './entity';
import { applyMixins } from './utils';

export interface AggregateRoot extends Entity, NestAggregateRoot {}
export abstract class AggregateRoot {}

applyMixins(AggregateRoot, [Entity, NestAggregateRoot]);
