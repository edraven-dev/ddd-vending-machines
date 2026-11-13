import type { Id } from '@vending-machines/shared';
import { Atm } from './atm';

export interface AtmRepository {
  findOne(id: Id): Atm | null | Promise<Atm | null>;
  save(atm: Atm): void | Promise<void>;
  delete(id: Id): void | Promise<void>;
}

export const AtmRepository = Symbol('AtmRepository');
