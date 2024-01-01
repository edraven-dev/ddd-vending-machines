import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { ReturnMoneyHandler } from '../../../../../app/snack-machine/commands/handlers/return-money.handler';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('ReturnMoneyHandler', () => {
  const snackMachine = { id: randomUUID(), returnMoney: jest.fn() };
  let handler: ReturnMoneyHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnMoneyHandler,
        { provide: SnackMachineRepository, useValue: { findOne: jest.fn(async () => snackMachine), save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<ReturnMoneyHandler>(ReturnMoneyHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');

      await handler.execute({ id: snackMachine.id });

      expect(spy).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id: snackMachine.id })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.returnMoney', async () => {
      await handler.execute({ id: snackMachine.id });

      expect(snackMachine.returnMoney).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      await handler.execute({ id: snackMachine.id });

      expect(repository.save).toHaveBeenCalledWith(snackMachine);
    });
  });
});
