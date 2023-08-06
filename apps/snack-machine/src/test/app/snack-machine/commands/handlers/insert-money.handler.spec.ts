import { Test, TestingModule } from '@nestjs/testing';
import { InsertMoneyHandler } from '../../../../../app/snack-machine/commands/handlers/insert-money.handler';
import { Money } from '../../../../../app/snack-machine/money';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('InsertMoneyHandler', () => {
  let handler: InsertMoneyHandler;
  let snackMachine: SnackMachine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsertMoneyHandler, { provide: SnackMachine, useValue: { insertMoney: jest.fn() } }],
    }).compile();

    handler = module.get<InsertMoneyHandler>(InsertMoneyHandler);
    snackMachine = module.get<SnackMachine>(SnackMachine);
  });

  describe('execute', () => {
    it('should call snackMachine.insertMoney', async () => {
      const money = Money.Dollar;

      await handler.execute({ money });

      expect(snackMachine.insertMoney).toHaveBeenCalled();
    });
  });
});
