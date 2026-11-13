import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { DeleteHeadOfficeHandler } from '../../../../../app/management/commands/handlers/delete-head-office.handler';
import { DeleteHeadOfficeCommand } from '../../../../../app/management/commands/impl/delete-head-office.command';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';

describe('DeleteHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(Id.generate());
  const repository = {
    findOne: vi.fn<HeadOfficeRepository['findOne']>(async () => headOffice),
    delete: vi.fn<HeadOfficeRepository['delete']>(),
  };
  const eventPublisher = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((headOffice) => headOffice),
  };
  let handler: DeleteHeadOfficeHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteHeadOfficeHandler,
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: EventPublisher, useValue: eventPublisher },
      ],
    }).compile();

    handler = module.get<DeleteHeadOfficeHandler>(DeleteHeadOfficeHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOfficeRepository.findOne with proper id', async () => {
      vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await handler.execute(new DeleteHeadOfficeCommand(headOffice.id));

      expect(repository.findOne).toHaveBeenCalledWith(headOffice.id);
    });

    it('should throw NotFoundException and delete nothing if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should apply HeadOfficeDeletedEvent, delete the head office and then commit', async () => {
      const apply = vi.spyOn(headOffice, 'apply');
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await handler.execute(new DeleteHeadOfficeCommand(headOffice.id));

      expect(apply).toHaveBeenCalledWith(expect.any(HeadOfficeDeletedEvent));
      expect(repository.delete).toHaveBeenCalledWith(headOffice.id);
      expect(repository.delete.mock.invocationCallOrder[0]).toBeLessThan(commit.mock.invocationCallOrder[0]);
    });

    it('should not commit when the delete fails', async () => {
      repository.delete.mockRejectedValueOnce(new Error('connection lost'));
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toThrow('connection lost');
      expect(commit).not.toHaveBeenCalled();
    });
  });
});
