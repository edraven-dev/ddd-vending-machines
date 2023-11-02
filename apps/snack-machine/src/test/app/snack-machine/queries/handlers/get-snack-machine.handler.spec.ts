import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'crypto';
import Currency from 'currency.js';
import { MoneyDto } from '../../../../../app/snack-machine/dto/money.dto';
import { SnackMachineDto } from '../../../../../app/snack-machine/dto/snack-machine.dto';
import { Money } from '../../../../../app/snack-machine/money';
import { GetSnackMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

jest.mock('../../../../../app/snack-machine/dto/snack-machine.dto', () => {
  return {
    SnackMachineDto: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('GetSnackMachineHandler', () => {
  const id = crypto.randomUUID();
  const snackMachine = new SnackMachine();
  Object.assign(snackMachine, { id });
  let handler: GetSnackMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetSnackMachineHandler, { provide: SnackMachine, useValue: snackMachine }],
    }).compile();

    handler = module.get<GetSnackMachineHandler>(GetSnackMachineHandler);
  });

  beforeEach(() => {
    snackMachine.returnMoney();
  });

  describe('execute', () => {
    it('should create SnackMachineDto with correct data', async () => {
      snackMachine.insertMoney(Money.FiveDollar);

      await handler.execute();

      expect(SnackMachineDto).toHaveBeenCalledWith(
        id,
        new MoneyDto(new Currency('5.00')),
        new MoneyDto(new Currency('5.00')),
        expect.any(Array),
      );
    });
  });
});
