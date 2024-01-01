import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('BuySnackHandler', () => {
  const snackMachine = { id: randomUUID(), buySnack: jest.fn() };
  let handler: BuySnackHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuySnackHandler,
        { provide: SnackMachineRepository, useValue: { findOne: jest.fn(async () => snackMachine), save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');

      await handler.execute({ id: snackMachine.id, position: 1 });

      expect(spy).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id: snackMachine.id, position: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.buySnack', async () => {
      await handler.execute({ id: snackMachine.id, position: 1 });

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      await handler.execute({ id: snackMachine.id, position: 1 });

      expect(repository.save).toHaveBeenCalledWith(snackMachine);
    });
  });
});
