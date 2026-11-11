import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import type { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('BuySnackHandler', () => {
  const snackMachine = {
    id: randomUUID(),
    buySnack: vi.fn<SnackMachine['buySnack']>(),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  const repositoryMock = {
    findOne: vi.fn<() => Promise<typeof snackMachine | null>>(async () => snackMachine),
    save: vi.fn<SnackMachineRepository['save']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let handler: BuySnackHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuySnackHandler,
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const id = snackMachine.id;
      const position = 1;

      await expect(handler.execute({ id, position })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.buySnack', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
