import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import crypto from 'crypto';
import { SnackMachineDto } from '../../../../../app/snack-machine/dto/snack-machine.dto';
import { GetSnackMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('GetSnackMachineHandler', () => {
  const id = crypto.randomUUID();
  const snackMachine = new SnackMachine(id);
  let handler: GetSnackMachineHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSnackMachineHandler,
        { provide: SnackMachineRepository, useValue: { findOne: jest.fn(async () => snackMachine) } },
      ],
    }).compile();

    handler = module.get<GetSnackMachineHandler>(GetSnackMachineHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  beforeEach(() => {
    snackMachine.returnMoney();
  });

  describe('#execute', () => {
    it('should call SnackMachineRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');

      await handler.execute({ id });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should return SnackMachineDto with correct data', async () => {
      snackMachine.insertMoney(Money.FiveDollar);

      const result = await handler.execute({ id });

      expect(result).toBeInstanceOf(SnackMachineDto);
      expect(result.id).toBe(id);
      expect(result.moneyInside.amount).toBe('$5.00');
      expect(result.moneyInTransaction.amount).toBe('$5.00');
    });
  });
});
