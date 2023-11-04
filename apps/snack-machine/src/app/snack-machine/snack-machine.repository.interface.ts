import { SnackMachine } from './snack-machine';

export interface SnackMachineRepository {
  findOne(): SnackMachine | null | Promise<SnackMachine | null>;
  save(snackMachine: SnackMachine): void | Promise<void>;
}

export const SnackMachineRepository = Symbol('SnackMachineRepository');
