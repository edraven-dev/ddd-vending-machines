import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { CreateSnackMachineHandler } from '../../../../../app/snack-machine/commands/handlers/create-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineFactory } from '../../../../../app/snack-machine/snack-machine.factory';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('CreateSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(randomUUID());
  const factoryMock = { create: vi.fn<SnackMachineFactory['create']>(() => snackMachine) };
  const repositoryMock = { save: vi.fn<SnackMachineRepository['save']>() };
  let handler: CreateSnackMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSnackMachineHandler,
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

      await handler.execute({ id });

      expect(factoryMock.create).toHaveBeenCalledWith(id);
    });

    it('should load money into Snack Machine', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'loadMoney');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(spy).toHaveBeenCalledWith(new Money(10, 10, 10, 10, 10, 10));
    });

    it('should load snacks into snack machine 3 times', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'loadSnacks');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should save Snack Machine with repository', async () => {
      vi.spyOn(SnackMachine.prototype, 'loadSnacks').mockImplementationOnce(vi.fn());
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should commit events', async () => {
      const spy = vi.spyOn(SnackMachine.prototype, 'commit');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(spy).toHaveBeenCalled();
    });
  });
});
