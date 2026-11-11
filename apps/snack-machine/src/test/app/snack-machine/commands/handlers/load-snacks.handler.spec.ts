import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { LoadSnacksHandler } from '../../../../../app/snack-machine/commands/handlers/load-snacks.handler';
import type { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';
import { SnackPile } from '../../../../../app/snack-machine/snack-pile';
import { Snack } from '../../../../../app/snack/snack';

describe('LoadSnacksHandler', () => {
  const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1));
  const snackMachine = {
    id: randomUUID(),
    getSnackPile: vi.fn<SnackMachine['getSnackPile']>(() => snackPile),
    loadSnacks: vi.fn<SnackMachine['loadSnacks']>(),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  const repositoryMock = {
    findOne: vi.fn<() => Promise<typeof snackMachine | null>>(async () => snackMachine),
    save: vi.fn<SnackMachineRepository['save']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let handler: LoadSnacksHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadSnacksHandler,
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<LoadSnacksHandler>(LoadSnacksHandler);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await handler.execute({ id, position, quantity });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await expect(handler.execute({ id, position, quantity })).rejects.toThrow(NotFoundException);
    });

    it('should get snack pile at correct position', async () => {
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await handler.execute({ id, position, quantity });

      expect(snackMachine.getSnackPile).toHaveBeenCalledWith(position);
    });

    it('should add quantity to snack pile', async () => {
      const spy = vi.spyOn(snackPile, 'addQuantity');
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await handler.execute({ id, position, quantity });

      expect(spy).toHaveBeenCalledWith(quantity);
    });

    it('should load snacks at correct position', async () => {
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;
      const snackPileWithAddedQuantity = snackPile.addQuantity(quantity);

      await handler.execute({ id, position, quantity });

      expect(snackMachine.loadSnacks).toHaveBeenCalledWith(position, snackPileWithAddedQuantity);
    });

    it('should save snack machine with correct data', async () => {
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await handler.execute({ id, position, quantity });

      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should commit events', async () => {
      const id = snackMachine.id;
      const position = 1;
      const quantity = 10;

      await handler.execute({ id, position, quantity });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
