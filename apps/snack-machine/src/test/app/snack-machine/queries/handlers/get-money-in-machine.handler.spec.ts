import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { MoneyInMachineDto } from '../../../../../app/snack-machine/dto/money-in-machine.dto';
import { GetMoneyInMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-money-in-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('GetMoneyInMachineHandler', () => {
  const snackMachine = new SnackMachine();
  let handler: GetMoneyInMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetMoneyInMachineHandler, { provide: SnackMachine, useValue: snackMachine }],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);
  });

  beforeEach(() => {
    snackMachine.returnMoney();
  });

  it('should return the money in transaction and money inside the snack machine', async () => {
    const result = await handler.execute();

    const dto = new MoneyInMachineDto(new Currency('0.00'), new Currency('0.00'));
    expect(result).toBeInstanceOf(MoneyInMachineDto);
    expect(result).toEqual(dto);
  });

  it('should return the cents when the amount is less than 100', async () => {
    snackMachine.insertMoney(Money.Cent);

    const result = await handler.execute();

    const dto = new MoneyInMachineDto(new Currency('0.01'), new Currency('0.01'));
    expect(result).toBeInstanceOf(MoneyInMachineDto);
    expect(result).toEqual(dto);
  });

  it('should return the dollars when the amount is greater than 100', async () => {
    snackMachine.insertMoney(Money.Dollar);

    const result = await handler.execute();

    const dto = new MoneyInMachineDto(new Currency('1.00'), new Currency('1.00'));
    expect(result).toBeInstanceOf(MoneyInMachineDto);
    expect(result).toEqual(dto);
  });
});
