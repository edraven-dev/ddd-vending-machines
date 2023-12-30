import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { BuySnackCommand } from '../../../app/snack-machine/commands/impl/buy-snack.command';
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

  describe('#insertMoney', () => {
    it('should execute InsertMoneyCommand with proper data', async () => {
      const money: [number, number, number, number, number, number] = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money });

      expect(commandBus.execute).toHaveBeenCalledWith({ money: new Money(...money) });
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(InsertMoneyCommand));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const money: [number, number, number, number, number, number] = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money });

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetSnackMachineQuery));
    });
  });

  describe('#buySnack', () => {
    it('should execute BuySnackCommand', async () => {
      await controller.buySnack({ position: 1 });

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(BuySnackCommand));
    });

    it('should execute GetSnackMachineQuery', async () => {
      await controller.buySnack({ position: 1 });

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetSnackMachineQuery));
    });
  });

  describe('#returnMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      await controller.returnMoney();

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ReturnMoneyCommand));
    });

    it('should execute GetSnackMachineQuery', async () => {
      await controller.returnMoney();

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetSnackMachineQuery));
    });
  });

  describe('#getMoneyInMachine', () => {
    it('should execute GetMoneyInMachineQuery', async () => {
      await controller.getMoneyInMachine();

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetMoneyInMachineQuery));
    });
  });

  describe('#unloadMoney', () => {
    it('should execute SnackMachineService.unloadMoney', async () => {
      await controller.unloadMoney();

      expect(service.unloadMoney).toHaveBeenCalled();
    });
  });
});
