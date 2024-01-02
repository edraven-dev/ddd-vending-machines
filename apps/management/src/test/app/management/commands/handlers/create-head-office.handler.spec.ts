import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateHeadOfficeHandler } from '../../../../../app/management/commands/handlers/create-head-office.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';

describe('CreateHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(randomUUID());
  let handler: CreateHeadOfficeHandler;
  let repository: HeadOfficeRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHeadOfficeHandler,
        { provide: HeadOfficeRepository, useValue: { save: jest.fn() } },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((headOffice) => headOffice) } },
      ],
    }).compile();

    handler = module.get<CreateHeadOfficeHandler>(CreateHeadOfficeHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOffice.apply', async () => {
      jest.spyOn(HeadOffice.prototype, 'apply');

      await handler.execute({ id: headOffice.id });

      expect(headOffice.apply).toHaveBeenCalled();
    });

    it('should call HeadOfficeRepository.save with proper data', async () => {
      await handler.execute({ id: headOffice.id });

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });

    it('should call headOffice.commit', async () => {
      jest.spyOn(HeadOffice.prototype, 'commit');

      await handler.execute({ id: headOffice.id });

      expect(headOffice.commit).toHaveBeenCalled();
    });
  });
});
