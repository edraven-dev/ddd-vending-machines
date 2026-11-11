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
  let handler: InsertMoneyHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsertMoneyHandler,
        {
          provide: SnackMachineRepository,
          useValue: {
            findOne: vi.fn<() => Promise<typeof snackMachine>>(async () => snackMachine),
            save: vi.fn<SnackMachineRepository['save']>(),
          },
        },
        {
          provide: EventPublisher,
          useValue: { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine) },
        },
      ],
    }).compile();

    handler = module.get<InsertMoneyHandler>(InsertMoneyHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const spy = vi.spyOn(repository, 'findOne');
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
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
      const spy = vi.spyOn(repository, 'save');
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(spy).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;
      const money = Money.Dollar;

      await handler.execute({ id, money });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
