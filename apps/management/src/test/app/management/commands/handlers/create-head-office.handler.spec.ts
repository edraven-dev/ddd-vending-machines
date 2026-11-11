import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateHeadOfficeHandler } from '../../../../../app/management/commands/handlers/create-head-office.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeFactory } from '../../../../../app/management/head-office.factory';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';

describe('CreateHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(randomUUID());
  const factory = { create: vi.fn<HeadOfficeFactory['create']>(() => headOffice) };
  const repository = { save: vi.fn<HeadOfficeRepository['save']>() };
  let handler: CreateHeadOfficeHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHeadOfficeHandler,
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: HeadOfficeFactory, useValue: factory },
      ],
    }).compile();

    handler = module.get<CreateHeadOfficeHandler>(CreateHeadOfficeHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOfficeFactory.create', async () => {
      const id = headOffice.id;

      await handler.execute({ id });

      expect(factory.create).toHaveBeenCalledWith(id);
    });

    it('should call HeadOfficeRepository.save with proper data', async () => {
      const id = headOffice.id;

      await handler.execute({ id });

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });

    it('should call headOffice.commit', async () => {
      const commit = vi.spyOn(HeadOffice.prototype, 'commit');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(commit).toHaveBeenCalled();
    });
  });
});
