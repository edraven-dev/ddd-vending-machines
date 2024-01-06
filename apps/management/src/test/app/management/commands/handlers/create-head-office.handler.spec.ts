import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateHeadOfficeHandler } from '../../../../../app/management/commands/handlers/create-head-office.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeFactory } from '../../../../../app/management/head-office.factory';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';

describe('CreateHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(randomUUID());
  let handler: CreateHeadOfficeHandler;
  let factory: HeadOfficeFactory;
  let repository: HeadOfficeRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHeadOfficeHandler,
        { provide: HeadOfficeRepository, useValue: { save: jest.fn() } },
        { provide: HeadOfficeFactory, useValue: { create: jest.fn(() => headOffice) } },
      ],
    }).compile();

    handler = module.get<CreateHeadOfficeHandler>(CreateHeadOfficeHandler);
    factory = module.get<HeadOfficeFactory>(HeadOfficeFactory);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOfficeFactory.create', async () => {
      jest.spyOn(factory, 'create');
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
      jest.spyOn(HeadOffice.prototype, 'commit');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(headOffice.commit).toHaveBeenCalled();
    });
  });
});
