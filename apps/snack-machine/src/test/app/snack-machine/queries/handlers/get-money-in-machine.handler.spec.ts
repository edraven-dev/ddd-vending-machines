import { Test, TestingModule } from '@nestjs/testing';
import Currency from 'currency.js';
import { MoneyInMachineDto } from '../../../../../app/snack-machine/dto/money-in-machine.dto';
import { MoneyDto } from '../../../../../app/snack-machine/dto/money.dto';
import { Money } from '../../../../../app/snack-machine/money';
import { GetMoneyInMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-money-in-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';

describe('GetMoneyInMachineHandler', () => {
  const amount = '¢0';
  let handler: GetMoneyInMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoneyInMachineHandler,
        {
          provide: SnackMachine,
          useValue: {
            moneyInTransaction: new Currency(0),
            moneyInside: Money.None,
          },
        },
      ],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);
  });

  describe('execute', () => {
    it('should return the money in transaction and money inside the snack machine', async () => {
      const result = await handler.execute();

      const dto = new MoneyInMachineDto();
      dto.moneyInside = new MoneyDto(amount);
      dto.moneyInTransaction = new MoneyDto(amount);
      expect(result).toBeInstanceOf(MoneyInMachineDto);
      expect(result).toEqual(dto);
    });
  });

  it('should return the cents when the amount is less than 100', async () => {
    const snackMachine = new SnackMachine();
    snackMachine.insertMoney(Money.Cent);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoneyInMachineHandler,
        {
          provide: SnackMachine,
          useValue: snackMachine,
        },
      ],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);

    const result = await handler.execute();

    const dto = new MoneyInMachineDto();
    dto.moneyInside = new MoneyDto('¢1');
    dto.moneyInTransaction = new MoneyDto('¢1');
    expect(result).toBeInstanceOf(MoneyInMachineDto);
    expect(result).toEqual(dto);
  });

  it('should return the dollars when the amount is greater than 100', async () => {
    const snackMachine = new SnackMachine();
    snackMachine.insertMoney(Money.Dollar);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoneyInMachineHandler,
        {
          provide: SnackMachine,
          useValue: snackMachine,
        },
      ],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);

    const result = await handler.execute();

    const dto = new MoneyInMachineDto();
    dto.moneyInside = new MoneyDto('$1.00');
    dto.moneyInTransaction = new MoneyDto('$1.00');
    expect(result).toBeInstanceOf(MoneyInMachineDto);
    expect(result).toEqual(dto);
  });
});
