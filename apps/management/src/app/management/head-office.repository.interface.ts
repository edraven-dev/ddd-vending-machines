import { HeadOffice } from './head-office';

export interface HeadOfficeRepository {
  findOne(): HeadOffice | null | Promise<HeadOffice | null>;
  save(headOffice: HeadOffice): void | Promise<void>;
}

export const HeadOfficeRepository = Symbol('HeadOfficeRepository');
