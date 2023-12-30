import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { TakeMoneyHandler } from './take-money.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [TakeMoneyHandler];
