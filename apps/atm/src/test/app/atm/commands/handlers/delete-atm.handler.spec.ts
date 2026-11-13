import { MikroORM } from '@mikro-orm/core';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AtmDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { Atm } from '../../../../../app/atm/atm';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { DeleteAtmHandler } from '../../../../../app/atm/commands/handlers/delete-atm.handler';
import { DeleteAtmCommand } from '../../../../../app/atm/commands/impl/delete-atm.command';

describe('DeleteAtmHandler', () => {
  const atm = new Atm(Id.generate());
  const repository = {
    findOne: vi.fn<AtmRepository['findOne']>(async () => atm),
    delete: vi.fn<AtmRepository['delete']>(),
  };
  const eventPublisher = { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((atm) => atm) };
  let handler: DeleteAtmHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAtmHandler,
        { provide: MikroORM, useValue: orm },
        { provide: AtmRepository, useValue: repository },
        { provide: EventPublisher, useValue: eventPublisher },
      ],
    }).compile();

    handler = module.get<DeleteAtmHandler>(DeleteAtmHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call atmRepository.findOne with proper id', async () => {
      vi.spyOn(atm, 'commit').mockResolvedValue();

      await handler.execute(new DeleteAtmCommand(atm.id));

      expect(repository.findOne).toHaveBeenCalledWith(atm.id);
    });

    it('should resolve without deleting or committing if Atm not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const commit = vi.spyOn(atm, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteAtmCommand(atm.id))).resolves.toBeUndefined();
      expect(repository.delete).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should apply AtmDeletedEvent, delete the atm and then commit', async () => {
      const apply = vi.spyOn(atm, 'apply');
      const commit = vi.spyOn(atm, 'commit').mockResolvedValue();

      await handler.execute(new DeleteAtmCommand(atm.id));

      expect(apply).toHaveBeenCalledWith(expect.any(AtmDeletedEvent));
      expect(repository.delete).toHaveBeenCalledWith(atm.id);
      expect(repository.delete.mock.invocationCallOrder[0]).toBeLessThan(commit.mock.invocationCallOrder[0]);
    });

    it('should not commit when the delete fails', async () => {
      repository.delete.mockRejectedValueOnce(new Error('connection lost'));
      const commit = vi.spyOn(atm, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteAtmCommand(atm.id))).rejects.toThrow('connection lost');
      expect(commit).not.toHaveBeenCalled();
    });
  });
});
