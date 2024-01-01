import { SnackMachine } from './snack-machine';

export interface SnackMachineRepository {
  findOne(id: string): SnackMachine | null | Promise<SnackMachine | null>;
  save(snackMachine: SnackMachine): void | Promise<void>;
}

export const SnackMachineRepository = Symbol('SnackMachineRepository');
