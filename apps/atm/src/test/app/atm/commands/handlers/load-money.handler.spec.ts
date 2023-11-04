import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { Atm } from '../../../../../app/atm/atm';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { LoadMoneyHandler } from '../../../../../app/atm/commands/handlers/load-money.handler';

describe('LoadMoneyHandler', () => {
  let handler: LoadMoneyHandler;
  let atm: Atm;
  let atmRepository: AtmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadMoneyHandler,
        { provide: Atm, useValue: { loadMoney: jest.fn() } },
        { provide: AtmRepository, useValue: { save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<LoadMoneyHandler>(LoadMoneyHandler);
    atm = module.get<Atm>(Atm);
    atmRepository = module.get<AtmRepository>(AtmRepository);
  });

  describe('execute', () => {
    it('should call atm.loadMoney', async () => {
      const money = Money.Dollar;

      await handler.execute({ money });

      expect(atm.loadMoney).toHaveBeenCalled();
    });

    it('should call atmRepository.save with proper data', async () => {
      await handler.execute({ money: Money.Dollar });

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });
  });
});
