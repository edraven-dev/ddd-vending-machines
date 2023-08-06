import { Test, TestingModule } from '@nestjs/testing';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('BuySnackHandler', () => {
  let handler: BuySnackHandler;
  let snackMachine: SnackMachine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuySnackHandler, { provide: SnackMachine, useValue: { buySnack: jest.fn() } }],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
    snackMachine = module.get<SnackMachine>(SnackMachine);
  });

  describe('execute', () => {
    it('should call snackMachine.buySnack', async () => {
      await handler.execute();

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });
  });
});
