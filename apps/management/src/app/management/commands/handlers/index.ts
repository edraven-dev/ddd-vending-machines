import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateHeadOfficeHandler } from './create-head-office.handler';
import { LoadCashToAtmHandler } from './load-cash-to-atm.handler';
import { UnloadCashFromSnackMachineHandler } from './unload-cash-from-snack-machine.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [
  CreateHeadOfficeHandler,
  LoadCashToAtmHandler,
  UnloadCashFromSnackMachineHandler,
];
