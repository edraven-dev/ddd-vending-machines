import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { TakeMoneyHandler } from '../../../../../app/atm/commands/handlers/take-money.handler';

describe('TakeMoneyHandler', () => {
  const atm = { id: randomUUID(), takeMoney: jest.fn(), commit: jest.fn() };
  let handler: TakeMoneyHandler;
  let atmRepository: AtmRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TakeMoneyHandler,
        {
          provide: AtmRepository,
          useValue: { findOne: jest.fn(async () => atm), save: jest.fn() },
        },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((atm) => atm) } },
      ],
    }).compile();

    handler = module.get<TakeMoneyHandler>(TakeMoneyHandler);
    atmRepository = module.get<AtmRepository>(AtmRepository);
  });

  describe('#execute', () => {
    it('should call atmRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(atmRepository, 'findOne');
      const id = atm.id;
      const amount = new Currency(1);

      await handler.execute({ id, amount });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if Atm not found', async () => {
      (atmRepository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const id = atm.id;
      const amount = new Currency(1);

      await expect(handler.execute({ id, amount })).rejects.toThrow(NotFoundException);
    });

    it('should call atm.takeMoney', async () => {
      const id = atm.id;
      const amount = new Currency(1);

      await handler.execute({ id, amount });

      expect(atm.takeMoney).toHaveBeenCalled();
    });

    it('should call atmRepository.save with proper data', async () => {
      const id = atm.id;
      const amount = new Currency(1);

      await handler.execute({ id, amount });

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });

    it('should call atm.commit', async () => {
      const id = atm.id;
      const amount = new Currency(1);

      await handler.execute({ id, amount });

      expect(atm.commit).toHaveBeenCalled();
    });
  });
});
