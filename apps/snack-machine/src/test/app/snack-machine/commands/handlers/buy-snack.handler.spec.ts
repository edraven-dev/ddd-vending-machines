import { Test, TestingModule } from '@nestjs/testing';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('BuySnackHandler', () => {
  let handler: BuySnackHandler;
  let snackMachine: SnackMachine;
  let snackMachineRepository: SnackMachineRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuySnackHandler,
        { provide: SnackMachine, useValue: { buySnack: jest.fn() } },
        { provide: SnackMachineRepository, useValue: { save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
    snackMachine = module.get<SnackMachine>(SnackMachine);
    snackMachineRepository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('execute', () => {
    it('should call snackMachine.buySnack', async () => {
      await handler.execute();

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      await handler.execute();

      expect(snackMachineRepository.save).toHaveBeenCalledWith(snackMachine);
    });
  });
});
