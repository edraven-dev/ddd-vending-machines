import { Atm } from './atm';

export interface AtmRepository {
  findOne(): Atm | null | Promise<Atm | null>;
  save(snackMachine: Atm): void | Promise<void>;
}

export const AtmRepository = Symbol('AtmRepository');
