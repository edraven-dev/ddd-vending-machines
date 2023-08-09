import { SnackMachine } from './snack-machine';

export interface SnackMachineRepository {
  findOne(): SnackMachine | Promise<SnackMachine | null> | null;
  save(snackMachine: SnackMachine): void | Promise<void>;
}

export const SnackMachineRepository = Symbol('SnackMachineRepository');
