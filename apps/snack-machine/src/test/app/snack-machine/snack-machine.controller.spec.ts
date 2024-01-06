import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CoinsAndNotes, Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { BuySnackCommand } from '../../../app/snack-machine/commands/impl/buy-snack.command';
import { CreateSnackMachineCommand } from '../../../app/snack-machine/commands/impl/create-snack-machine.command';
import { InsertMoneyCommand } from '../../../app/snack-machine/commands/impl/insert-money.command';
import { ReturnMoneyCommand } from '../../../app/snack-machine/commands/impl/return-money.command';
import { GetMoneyInMachineQuery } from '../../../app/snack-machine/queries/impl/get-money-in-machine.query';
import { GetSnackMachineQuery } from '../../../app/snack-machine/queries/impl/get-snack-machine.query';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineController', () => {
  let controller: SnackMachineController;
  let service: SnackMachineService;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
        { provide: SnackMachineService, useValue: { unloadMoney: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SnackMachineController>(SnackMachineController);
    service = module.get<SnackMachineService>(SnackMachineService);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getById', () => {
    it('should execute GetSnackMachineQuery', async () => {
      const id = randomUUID();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#create', () => {
    it('should execute CreateSnackMachineCommand', async () => {
      const id = randomUUID();

      await controller.create({ id });

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateSnackMachineCommand(id));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = randomUUID();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#insertMoney', () => {
    it('should execute InsertMoneyCommand with proper data', async () => {
      const id = randomUUID();
      const money: CoinsAndNotes = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new InsertMoneyCommand(id, new Money(...money)));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = randomUUID();
      const money: CoinsAndNotes = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#buySnack', () => {
    it('should execute BuySnackCommand', async () => {
      const id = randomUUID();

      await controller.buySnack({ position: 1 }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new BuySnackCommand(id, 1));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = randomUUID();

      await controller.buySnack({ position: 1 }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#returnMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      const id = randomUUID();

      await controller.returnMoney(id);

      expect(commandBus.execute).toHaveBeenCalledWith(new ReturnMoneyCommand(id));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = randomUUID();

      await controller.returnMoney(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#getMoneyInMachine', () => {
    it('should execute GetMoneyInMachineQuery', async () => {
      const id = randomUUID();

      await controller.getMoneyInMachine(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetMoneyInMachineQuery(id));
    });
  });

  describe('#unloadMoney', () => {
    it('should execute SnackMachineService.unloadMoney', async () => {
      const id = randomUUID();

      await controller.unloadMoney({ id });

      expect(service.unloadMoney).toHaveBeenCalled();
    });
  });
});
