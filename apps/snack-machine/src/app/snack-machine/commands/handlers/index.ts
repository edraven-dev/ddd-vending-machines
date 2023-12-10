import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { BuySnackHandler } from './buy-snack.handler';
import { InsertMoneyHandler } from './insert-money.handler';
import { ReturnMoneyHandler } from './return-money.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [BuySnackHandler, InsertMoneyHandler, ReturnMoneyHandler];
