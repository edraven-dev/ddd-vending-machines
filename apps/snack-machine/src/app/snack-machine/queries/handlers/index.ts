import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetMoneyInMachineHandler } from './get-money-in-machine.handler';
import { GetSnackMachineHandler } from './get-snack-machine.handler';

export const QueryHandlers: Type<IQueryHandler>[] = [GetMoneyInMachineHandler, GetSnackMachineHandler];
