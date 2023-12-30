import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { LoadCashToAtmHandler } from './load-cash-to-atm.handler';
import { UnloadCashFromSnackMachineHandler } from './unload-cash-from-snack-machine.handler';

export const CommandHandlers: Type<ICommandHandler>[] = [LoadCashToAtmHandler, UnloadCashFromSnackMachineHandler];
