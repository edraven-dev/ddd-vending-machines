import { MikroORM } from '@mikro-orm/core';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import { CreateSnackMachineHandler } from '../../../../../app/snack-machine/commands/handlers/create-snack-machine.handler';
import { CreateSnackMachineCommand } from '../../../../../app/snack-machine/commands/impl/create-snack-machine.command';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineFactory } from '../../../../../app/snack-machine/snack-machine.factory';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('CreateSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(Id.generate());
  const factoryMock = { create: vi.fn<SnackMachineFactory['create']>(() => snackMachine) };
  const repositoryMock = {
    exists: vi.fn<SnackMachineRepository['exists']>(async () => false),
    save: vi.fn<SnackMachineRepository['save']>(),
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
  let handler: CreateSnackMachineHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}), transactional } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSnackMachineHandler,
        { provide: MikroORM, useValue: orm },
        { provide: SnackMachineFactory, useValue: factoryMock },
        { provide: SnackMachineRepository, useValue: repositoryMock },
      ],
    }).compile();

    handler = module.get<CreateSnackMachineHandler>(CreateSnackMachineHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should create Snack Machine entity', async () => {
      const id = snackMachine.id;

      await handler.execute(new CreateSnackMachineCommand(id));

      expect(factoryMock.create).toHaveBeenCalledWith(id);
    });

    it('should load money into Snack Machine', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'loadMoney');
      const id = snackMachine.id;

      await handler.execute(new CreateSnackMachineCommand(id));

      expect(spy).toHaveBeenCalledWith(new Money(10, 10, 10, 10, 10, 10));
    });

    it('should load snacks into snack machine 3 times', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'loadSnacks');
      const id = snackMachine.id;

      await handler.execute(new CreateSnackMachineCommand(id));

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should save Snack Machine with repository', async () => {
      vi.spyOn(SnackMachine.prototype, 'loadSnacks').mockImplementationOnce(vi.fn());
      const id = snackMachine.id;

      await handler.execute(new CreateSnackMachineCommand(id));

      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should commit events', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'commit');
      const id = snackMachine.id;

      await handler.execute(new CreateSnackMachineCommand(id));

      expect(spy).toHaveBeenCalled();
    });

    it('should throw ConflictException and save nothing if the Snack Machine already exists', async () => {
      repositoryMock.exists.mockResolvedValueOnce(true);
      const commit = vi.spyOn(SnackMachine.prototype, 'commit');

      await expect(handler.execute(new CreateSnackMachineCommand(snackMachine.id))).rejects.toThrow(
        new ConflictException(`Snack machine with id ${snackMachine.id.value} already exists`),
      );

      expect(factoryMock.create).not.toHaveBeenCalled();
      expect(repositoryMock.save).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should check whether the Snack Machine exists and save it in one transaction', async () => {
      const inTransactionAt: boolean[] = [];
      repositoryMock.exists.mockImplementationOnce(async () => {
        inTransactionAt.push(inTransaction);
        return false;
      });
      repositoryMock.save.mockImplementationOnce(async () => {
        inTransactionAt.push(inTransaction);
      });

      await handler.execute(new CreateSnackMachineCommand(snackMachine.id));

      expect(inTransactionAt).toEqual([true, true]);
    });
  });
});
