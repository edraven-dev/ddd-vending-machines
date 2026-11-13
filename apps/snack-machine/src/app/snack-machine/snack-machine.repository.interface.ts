import type { Id } from '@vending-machines/shared';
import { SnackMachine } from './snack-machine';

export interface SnackMachineRepository {
  findOne(id: Id): SnackMachine | null | Promise<SnackMachine | null>;
  save(snackMachine: SnackMachine): void | Promise<void>;
  delete(id: Id): void | Promise<void>;
}

export const SnackMachineRepository = Symbol('SnackMachineRepository');
