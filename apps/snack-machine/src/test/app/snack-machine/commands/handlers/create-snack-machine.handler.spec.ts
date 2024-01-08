import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { CreateSnackMachineHandler } from '../../../../../app/snack-machine/commands/handlers/create-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineFactory } from '../../../../../app/snack-machine/snack-machine.factory';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('CreateSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(randomUUID());
  let handler: CreateSnackMachineHandler;
  let factory: SnackMachineFactory;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSnackMachineHandler,
        { provide: SnackMachineFactory, useValue: { create: jest.fn(() => snackMachine) } },
        { provide: SnackMachineRepository, useValue: { save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<CreateSnackMachineHandler>(CreateSnackMachineHandler);
    factory = module.get<SnackMachineFactory>(SnackMachineFactory);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should create Snack Machine entity', async () => {
      jest.spyOn(factory, 'create');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(factory.create).toHaveBeenCalledWith(id);
    });

    it('should load money into Snack Machine', async () => {
      jest.spyOn(SnackMachine.prototype, 'loadMoney');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(snackMachine.loadMoney).toHaveBeenCalledWith(new Money(10, 10, 10, 10, 10, 10));
    });

    it('should load snacks into snack machine 3 times', async () => {
      jest.spyOn(SnackMachine.prototype, 'loadSnacks');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(snackMachine.loadSnacks).toHaveBeenCalledTimes(3);
    });

    it('should save Snack Machine with repository', async () => {
      jest.spyOn(SnackMachine.prototype, 'loadSnacks').mockImplementationOnce(() => {});
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith({ ...snackMachine, slots: expect.any(Array) });
    });

    it('should commit events', async () => {
      jest.spyOn(SnackMachine.prototype, 'commit');
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
