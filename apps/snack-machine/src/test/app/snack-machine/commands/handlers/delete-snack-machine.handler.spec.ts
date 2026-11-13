import { MikroORM } from '@mikro-orm/core';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { SnackMachineDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { DeleteSnackMachineHandler } from '../../../../../app/snack-machine/commands/handlers/delete-snack-machine.handler';
import { DeleteSnackMachineCommand } from '../../../../../app/snack-machine/commands/impl/delete-snack-machine.command';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('DeleteSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(Id.generate());
  const repositoryMock = {
    findOne: vi.fn<SnackMachineRepository['findOne']>(async () => snackMachine),
    delete: vi.fn<SnackMachineRepository['delete']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let handler: DeleteSnackMachineHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSnackMachineHandler,
        { provide: MikroORM, useValue: orm },
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<DeleteSnackMachineHandler>(DeleteSnackMachineHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with proper id', async () => {
      vi.spyOn(snackMachine, 'commit').mockResolvedValue();

      await handler.execute(new DeleteSnackMachineCommand(snackMachine.id));

      expect(repositoryMock.findOne).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should resolve without deleting or committing if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const commit = vi.spyOn(snackMachine, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteSnackMachineCommand(snackMachine.id))).resolves.toBeUndefined();
      expect(repositoryMock.delete).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should apply SnackMachineDeletedEvent, delete the snack machine and then commit', async () => {
      const apply = vi.spyOn(snackMachine, 'apply');
      const commit = vi.spyOn(snackMachine, 'commit').mockResolvedValue();

      await handler.execute(new DeleteSnackMachineCommand(snackMachine.id));

      expect(apply).toHaveBeenCalledWith(expect.any(SnackMachineDeletedEvent));
      expect(repositoryMock.delete).toHaveBeenCalledWith(snackMachine.id);
      expect(repositoryMock.delete.mock.invocationCallOrder[0]).toBeLessThan(commit.mock.invocationCallOrder[0]);
    });

    it('should not commit when the delete fails', async () => {
      repositoryMock.delete.mockRejectedValueOnce(new Error('connection lost'));
      const commit = vi.spyOn(snackMachine, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteSnackMachineCommand(snackMachine.id))).rejects.toThrow('connection lost');
      expect(commit).not.toHaveBeenCalled();
    });
  });
});
