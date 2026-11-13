import type { Id } from '@vending-machines/shared';
import { HeadOffice } from './head-office';

export interface HeadOfficeRepository {
  findOne(id: Id): HeadOffice | null | Promise<HeadOffice | null>;
  findByAtmId(atmId: Id): HeadOffice | null | Promise<HeadOffice | null>;
  findExpired(now: Date): HeadOffice[] | Promise<HeadOffice[]>;
  save(headOffice: HeadOffice): void | Promise<void>;
  delete(id: Id): void | Promise<void>;
}

export const HeadOfficeRepository = Symbol('HeadOfficeRepository');
