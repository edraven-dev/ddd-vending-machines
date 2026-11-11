import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { ReturnMoneyHandler } from '../../../../../app/snack-machine/commands/handlers/return-money.handler';
import type { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('ReturnMoneyHandler', () => {
  const snackMachine = {
    id: randomUUID(),
    returnMoney: vi.fn<SnackMachine['returnMoney']>(),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  const repositoryMock = {
    findOne: vi.fn<() => Promise<typeof snackMachine | null>>(async () => snackMachine),
    save: vi.fn<SnackMachineRepository['save']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let handler: ReturnMoneyHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnMoneyHandler,
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<ReturnMoneyHandler>(ReturnMoneyHandler);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const id = snackMachine.id;

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.returnMoney', async () => {
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(snackMachine.returnMoney).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
