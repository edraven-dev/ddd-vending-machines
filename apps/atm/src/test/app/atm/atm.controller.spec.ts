import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import currency from 'currency.js';
import { AtmController } from '../../../app/atm/atm.controller';
import { LoadMoneyCommand } from '../../../app/atm/commands/impl/load-money.command';
import { TakeMoneyCommand } from '../../../app/atm/commands/impl/take-money.command';
import { GetAtmQuery } from '../../../app/atm/queries/impl/get-atm.query';

describe('AtmController', () => {
  let controller: AtmController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtmController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AtmController>(AtmController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getAtm', () => {
    it('should execute GetAtmQuery', async () => {
      await controller.getAtm();

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetAtmQuery));
    });
  });

  describe('#loadMoney', () => {
    it('should execute LoadCommand', async () => {
      await controller.loadMoney({ money: [0, 0, 0, 0, 0, 1] });

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(LoadMoneyCommand));
    });

    it('should execute GetAtmQuery', async () => {
      await controller.loadMoney({ money: [0, 0, 0, 0, 0, 1] });

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetAtmQuery));
    });
  });

  describe('#takeMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      await controller.takeMoney({ amount: new currency(1) });

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TakeMoneyCommand));
    });

    it('should execute GetAtmQuery', async () => {
      await controller.takeMoney({ amount: new currency(1) });

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetAtmQuery));
    });
  });
});
