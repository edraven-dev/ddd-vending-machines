import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { SnackMachineCreatedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import { CreateSnackMachineHandler } from '../../../../../app/snack-machine/commands/handlers/create-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('CreateSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(randomUUID());
  let handler: CreateSnackMachineHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSnackMachineHandler,
        { provide: SnackMachineRepository, useValue: { save: jest.fn() } },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((snackMachine) => snackMachine) } },
      ],
    }).compile();

    handler = module.get<CreateSnackMachineHandler>(CreateSnackMachineHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    // it('should call eventPublisher.mergeObjectContext with proper data', async () => {
    //   await handler.execute({ id: snackMachine.id });

    //   expect(EventPublisher.prototype.mergeObjectContext).toHaveBeenCalledWith(snackMachine);
    // });

    it('should call snackMachine.apply', async () => {
      jest.spyOn(SnackMachine.prototype, 'apply');

      await handler.execute({ id: snackMachine.id });

      expect(snackMachine.apply).toHaveBeenCalledWith(expect.any(SnackMachineCreatedEvent));
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      jest.spyOn(SnackMachine.prototype, 'loadSnacks').mockImplementationOnce(() => {});

      await handler.execute({ id: snackMachine.id });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith({ ...snackMachine, slots: expect.any(Array) });
    });

    it('should call snackMachine.commit', async () => {
      jest.spyOn(SnackMachine.prototype, 'commit');

      await handler.execute({ id: snackMachine.id });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
