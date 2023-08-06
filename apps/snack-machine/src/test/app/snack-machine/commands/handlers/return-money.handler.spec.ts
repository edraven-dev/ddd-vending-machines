import { Test, TestingModule } from '@nestjs/testing';
import { ReturnMoneyHandler } from '../../../../../app/snack-machine/commands/handlers/return-money.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('ReturnMoneyHandler', () => {
  let handler: ReturnMoneyHandler;
  let snackMachine: SnackMachine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnMoneyHandler, { provide: SnackMachine, useValue: { returnMoney: jest.fn() } }],
    }).compile();

    handler = module.get<ReturnMoneyHandler>(ReturnMoneyHandler);
    snackMachine = module.get<SnackMachine>(SnackMachine);
  });

  describe('execute', () => {
    it('should call snackMachine.returnMoney', async () => {
      await handler.execute();

      expect(snackMachine.returnMoney).toHaveBeenCalled();
    });
  });
});
