import type { Id } from '@vending-machines/shared';
import { HeadOffice } from './head-office';

export interface HeadOfficeRepository {
  findAll(): HeadOffice[] | Promise<HeadOffice[]>;
  findOne(id: Id): HeadOffice | null | Promise<HeadOffice | null>;
  save(headOffice: HeadOffice): void | Promise<void>;
  delete(id: Id): void | Promise<void>;
}

export const HeadOfficeRepository = Symbol('HeadOfficeRepository');
