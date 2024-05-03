import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('BuySnackHandler', () => {
  const snackMachine = { id: randomUUID(), buySnack: jest.fn(), commit: jest.fn() };
  let handler: BuySnackHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuySnackHandler,
        { provide: SnackMachineRepository, useValue: { findOne: jest.fn(async () => snackMachine), save: jest.fn() } },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((snackMachine) => snackMachine) } },
      ],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const id = snackMachine.id;
      const position = 1;

      await expect(handler.execute({ id, position })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.buySnack', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(repository.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
