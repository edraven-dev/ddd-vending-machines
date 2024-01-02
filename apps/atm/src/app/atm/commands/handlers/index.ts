import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateAtmHandler } from './create-atm.handler';
import { TakeMoneyHandler } from './take-money.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [CreateAtmHandler, TakeMoneyHandler];
