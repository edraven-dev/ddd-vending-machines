import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetAtmHandler } from './get-atm.handler';

export const QueryHandlers: Type<IQueryHandler>[] = [GetAtmHandler];
