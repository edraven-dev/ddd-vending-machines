import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { LoadMoneyDto, Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { AtmController } from '../../../app/atm/atm.controller';
import { AtmService } from '../../../app/atm/atm.service';
import { CreateAtmCommand } from '../../../app/atm/commands/impl/create-atm.command';
import { TakeMoneyCommand } from '../../../app/atm/commands/impl/take-money.command';
import { GetAtmQuery } from '../../../app/atm/queries/impl/get-atm.query';

describe('AtmController', () => {
  const id = randomUUID();
  let controller: AtmController;
  let service: AtmService;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtmController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
        { provide: AtmService, useValue: { loadMoney: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AtmController>(AtmController);
    service = module.get<AtmService>(AtmService);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getById', () => {
    it('should execute GetAtmQuery', async () => {
      await controller.getById(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetAtmQuery(id));
    });
  });

  describe('#create', () => {
    it('should execute CreateAtmCommand', async () => {
      await controller.create({ id });

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateAtmCommand(id));
    });

    it('should execute GetAtmQuery', async () => {
      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetAtmQuery(id));
    });
  });

  describe('#takeMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      await controller.takeMoney({ amount: new Currency(1) }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new TakeMoneyCommand(id, new Currency(1)));
    });

    it('should execute GetAtmQuery', async () => {
      await controller.takeMoney({ amount: new Currency(1) }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetAtmQuery(id));
    });
  });

  describe('#loadMoney', () => {
    it('should execute AtmService.loadMoney', async () => {
      const dto: LoadMoneyDto = { id, money: [1, 1, 1, 1, 1, 1] };

      await controller.loadMoney(dto);

      expect(service.loadMoney).toHaveBeenCalledWith(id, new Money(...dto.money));
    });
  });
});
