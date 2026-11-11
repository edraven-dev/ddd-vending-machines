import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { InsertMoneyHandler } from '../../../../../app/snack-machine/commands/handlers/insert-money.handler';
import type { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('InsertMoneyHandler', () => {
  const snackMachine = {
    id: randomUUID(),
    insertMoney: vi.fn<SnackMachine['insertMoney']>(),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  const repositoryMock = {
    findOne: vi.fn<() => Promise<typeof snackMachine | null>>(async () => snackMachine),
    save: vi.fn<SnackMachineRepository['save']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let handler: InsertMoneyHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsertMoneyHandler,
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<InsertMoneyHandler>(InsertMoneyHandler);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const id = snackMachine.id;
      const money = Money.Dollar;

      await expect(handler.execute({ id, money })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.insertMoney', async () => {
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(snackMachine.insertMoney).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
