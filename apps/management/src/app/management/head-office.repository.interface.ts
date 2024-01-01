import { HeadOffice } from './head-office';

export interface HeadOfficeRepository {
  findOne(id: string): HeadOffice | null | Promise<HeadOffice | null>;
  save(headOffice: HeadOffice): void | Promise<void>;
}

export const HeadOfficeRepository = Symbol('HeadOfficeRepository');
