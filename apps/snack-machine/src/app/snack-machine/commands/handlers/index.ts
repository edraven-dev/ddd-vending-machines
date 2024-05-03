import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { BuySnackHandler } from './buy-snack.handler';
import { CreateSnackMachineHandler } from './create-snack-machine.handler';
import { InsertMoneyHandler } from './insert-money.handler';
import { LoadSnacksHandler } from './load-snacks.handler';
import { ReturnMoneyHandler } from './return-money.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [
  BuySnackHandler,
  CreateSnackMachineHandler,
  InsertMoneyHandler,
  ReturnMoneyHandler,
  LoadSnacksHandler,
];
