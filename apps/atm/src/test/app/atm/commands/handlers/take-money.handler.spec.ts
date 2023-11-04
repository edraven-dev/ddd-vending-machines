import { Test, TestingModule } from '@nestjs/testing';
import Currency from 'currency.js';
import { Atm } from '../../../../../app/atm/atm';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { TakeMoneyHandler } from '../../../../../app/atm/commands/handlers/take-money.handler';

describe('TakeMoneyHandler', () => {
  let handler: TakeMoneyHandler;
  let atm: Atm;
  let atmRepository: AtmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TakeMoneyHandler,
        { provide: Atm, useValue: { takeMoney: jest.fn() } },
        { provide: AtmRepository, useValue: { save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<TakeMoneyHandler>(TakeMoneyHandler);
    atm = module.get<Atm>(Atm);
    atmRepository = module.get<AtmRepository>(AtmRepository);
  });

  describe('execute', () => {
    it('should call atm.takeMoney', async () => {
      await handler.execute({ amount: new Currency(1) });

      expect(atm.takeMoney).toHaveBeenCalled();
    });

    it('should call atmRepository.save with proper data', async () => {
      await handler.execute({ amount: new Currency(1) });

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });
  });
});
