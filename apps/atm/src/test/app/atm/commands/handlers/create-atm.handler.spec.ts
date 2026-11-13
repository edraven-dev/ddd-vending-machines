import { MikroORM } from '@mikro-orm/core';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import { Atm } from '../../../../../app/atm/atm';
import { AtmFactory } from '../../../../../app/atm/atm.factory';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { CreateAtmHandler } from '../../../../../app/atm/commands/handlers/create-atm.handler';
import { CreateAtmCommand } from '../../../../../app/atm/commands/impl/create-atm.command';

describe('CreateAtmHandler', () => {
  const atm = new Atm(Id.generate());
  const factory = { create: vi.fn<AtmFactory['create']>(() => atm) };
  const atmRepository = {
    exists: vi.fn<AtmRepository['exists']>(async () => false),
    save: vi.fn<AtmRepository['save']>(),
  };
  let inTransaction = false;
  const transactional = vi.fn<(callback: () => Promise<unknown>) => Promise<unknown>>(async (callback) => {
    inTransaction = true;
    try {
      return await callback();
    } finally {
      inTransaction = false;
    }
  });
  let handler: CreateAtmHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}), transactional } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAtmHandler,
        { provide: MikroORM, useValue: orm },
        { provide: AtmFactory, useValue: factory },
        { provide: AtmRepository, useValue: atmRepository },
      ],
    }).compile();

    handler = module.get<CreateAtmHandler>(CreateAtmHandler);
  });

  describe('#execute', () => {
    it('should create ATM entity', async () => {
      vi.spyOn(factory, 'create');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(factory.create).toHaveBeenCalledWith(id);
    });

    it('should load money into ATM', async () => {
      const loadMoney = vi.spyOn(Atm.prototype, 'loadMoney');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(loadMoney).toHaveBeenCalledWith(new Money(100, 100, 100, 100, 100, 100));
    });

    it('should save ATM with repository', async () => {
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });

    it('should commit events', async () => {
      const commit = vi.spyOn(Atm.prototype, 'commit');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(commit).toHaveBeenCalled();
    });

    it('should throw ConflictException and save nothing if the ATM already exists', async () => {
      atmRepository.exists.mockResolvedValueOnce(true);
      const commit = vi.spyOn(Atm.prototype, 'commit');

      await expect(handler.execute(new CreateAtmCommand(atm.id))).rejects.toThrow(
        new ConflictException(`Atm with id ${atm.id.value} already exists`),
      );

      expect(factory.create).not.toHaveBeenCalled();
      expect(atmRepository.save).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should check whether the ATM exists and save it in one transaction', async () => {
      const inTransactionAt: boolean[] = [];
      atmRepository.exists.mockImplementationOnce(async () => {
        inTransactionAt.push(inTransaction);
        return false;
      });
      atmRepository.save.mockImplementationOnce(async () => {
        inTransactionAt.push(inTransaction);
      });

      await handler.execute(new CreateAtmCommand(atm.id));

      expect(inTransactionAt).toEqual([true, true]);
    });
  });
});
