import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { MoneyInMachineDto } from '../../../../../app/snack-machine/dto/money-in-machine.dto';
import { GetMoneyInMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-money-in-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('GetMoneyInMachineHandler', () => {
  const snackMachine = new SnackMachine();
  let handler: GetMoneyInMachineHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoneyInMachineHandler,
        { provide: SnackMachineRepository, useValue: { findOne: jest.fn(async () => snackMachine) } },
      ],
    }).compile();

    handler = module.get<GetMoneyInMachineHandler>(GetMoneyInMachineHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  beforeEach(() => {
    snackMachine.returnMoney();
  });

  describe('#execute', () => {
    it('should call SnackMachineRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');

      await handler.execute({ id: snackMachine.id });

      expect(spy).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id: snackMachine.id })).rejects.toThrow(NotFoundException);
    });

    it('should return the money in transaction and money inside the snack machine', async () => {
      const result = await handler.execute({ id: snackMachine.id });

      const dto = new MoneyInMachineDto(new Currency('0.00'), new Currency('0.00'));
      expect(result).toBeInstanceOf(MoneyInMachineDto);
      expect(result).toEqual(dto);
    });

    it('should return the cents when the amount is less than 100', async () => {
      snackMachine.insertMoney(Money.Cent);

      const result = await handler.execute({ id: snackMachine.id });

      const dto = new MoneyInMachineDto(new Currency('0.01'), new Currency('0.01'));
      expect(result).toBeInstanceOf(MoneyInMachineDto);
      expect(result).toEqual(dto);
    });

    it('should return the dollars when the amount is greater than 100', async () => {
      snackMachine.insertMoney(Money.Dollar);

      const result = await handler.execute({ id: snackMachine.id });

      const dto = new MoneyInMachineDto(new Currency('1.00'), new Currency('1.00'));
      expect(result).toBeInstanceOf(MoneyInMachineDto);
      expect(result).toEqual(dto);
    });
  });
});
