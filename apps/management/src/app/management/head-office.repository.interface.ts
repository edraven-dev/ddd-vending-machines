import { HeadOffice } from './head-office';

export interface HeadOfficeRepository {
  findAll(): HeadOffice[] | Promise<HeadOffice[]>;
  findOne(id: string): HeadOffice | null | Promise<HeadOffice | null>;
  save(headOffice: HeadOffice): void | Promise<void>;
  delete(id: string): void | Promise<void>;
}

export const HeadOfficeRepository = Symbol('HeadOfficeRepository');
