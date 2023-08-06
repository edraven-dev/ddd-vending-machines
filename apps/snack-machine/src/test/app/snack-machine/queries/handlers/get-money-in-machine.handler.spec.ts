import { Test, TestingModule } from '@nestjs/testing';
import { GetMoneyInMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-money-in-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('GetMoneyInMachineHandler', () => {
  const amount = '¢0';
  let handler: GetMoneyInMachineHandler;
  let snackMachine: SnackMachine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoneyInMachineHandler,
        {
          provide: SnackMachine,
          useValue: {
            moneyInTransaction: {
              toDto: jest.fn().mockReturnValue({ amount }),
            },
            moneyInside: {
              toDto: jest.fn().mockReturnValue({ amount }),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);
    snackMachine = module.get<SnackMachine>(SnackMachine);
  });

  describe('execute', () => {
    it('should return the money in transaction and money inside the snack machine', async () => {
      const result = await handler.execute();

      expect(result).toEqual({
        moneyInTransaction: { amount },
        moneyInside: { amount },
      });
    });

    it('should call toDto on the moneyInTransaction and moneyInside properties of the SnackMachine', async () => {
      await handler.execute();

      expect(snackMachine.moneyInTransaction.toDto).toHaveBeenCalled();
      expect(snackMachine.moneyInside.toDto).toHaveBeenCalled();
    });
  });
});
