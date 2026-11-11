import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { SnackMachineDto } from '../../../../../app/snack-machine/dto/snack-machine.dto';
import { GetSnackMachineHandler } from '../../../../../app/snack-machine/queries/handlers/get-snack-machine.handler';
import { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('GetSnackMachineHandler', () => {
  const snackMachine = new SnackMachine(randomUUID());
  const repositoryMock = { findOne: vi.fn<SnackMachineRepository['findOne']>(async () => snackMachine) };
  let handler: GetSnackMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetSnackMachineHandler, { provide: SnackMachineRepository, useValue: repositoryMock }],
    }).compile();

    handler = module.get<GetSnackMachineHandler>(GetSnackMachineHandler);
  });

  beforeEach(() => {
    snackMachine.returnMoney();
  });

  describe('#execute', () => {
    it('should call SnackMachineRepository.findOne with correct id', async () => {
      const id = snackMachine.id;

      await handler.execute({ id });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const id = snackMachine.id;

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should return SnackMachineDto with correct data', async () => {
      snackMachine.insertMoney(Money.FiveDollar);
      const id = snackMachine.id;

      const result = await handler.execute({ id });

      expect(result).toBeInstanceOf(SnackMachineDto);
      expect(result.id).toBe(id);
      expect(result.moneyInside.amount).toBe('$5.00');
      expect(result.moneyInTransaction.amount).toBe('$5.00');
    });
  });
});
