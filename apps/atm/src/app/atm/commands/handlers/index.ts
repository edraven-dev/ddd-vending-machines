import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { LoadMoneyHandler } from './load-money.handler';
import { TakeMoneyHandler } from './take-money.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [LoadMoneyHandler, TakeMoneyHandler];
