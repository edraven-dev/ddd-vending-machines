import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { BuySnackCommand } from '../../../app/snack-machine/commands/impl/buy-snack.command';
import { InsertMoneyCommand } from '../../../app/snack-machine/commands/impl/insert-money.command';
import { ReturnMoneyCommand } from '../../../app/snack-machine/commands/impl/return-money.command';
import { Money } from '../../../app/snack-machine/money';
import { GetMoneyInMachineQuery } from '../../../app/snack-machine/queries/impl/get-money-in-machine.query';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';

describe('SnackMachineController', () => {
  let controller: SnackMachineController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SnackMachineController>(SnackMachineController);
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

      expect(commandBus.execute).toBeCalledWith({ money: new Money(...money) });
      expect(commandBus.execute).toBeCalledWith(expect.any(InsertMoneyCommand));
    });

    it('should execute GetMoneyInMachineQuery', async () => {
      const money: [number, number, number, number, number, number] = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money });

      expect(queryBus.execute).toBeCalledWith(expect.any(GetMoneyInMachineQuery));
    });
  });

  describe('#buySnack', () => {
    it('should execute BuySnackCommand', async () => {
      await controller.buySnack();

      expect(commandBus.execute).toBeCalledWith(expect.any(BuySnackCommand));
    });

    it('should execute GetMoneyInMachineQuery', async () => {
      await controller.buySnack();

      expect(queryBus.execute).toBeCalledWith(expect.any(GetMoneyInMachineQuery));
    });
  });

  describe('#returnMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      await controller.returnMoney();

      expect(commandBus.execute).toBeCalledWith(expect.any(ReturnMoneyCommand));
    });

    it('should execute GetMoneyInMachineQuery', async () => {
      await controller.returnMoney();

      expect(queryBus.execute).toBeCalledWith(expect.any(GetMoneyInMachineQuery));
    });
  });

  describe('#getMoneyInMachine', () => {
    it('should execute GetMoneyInMachineQuery', async () => {
      await controller.getMoneyInMachine();

      expect(queryBus.execute).toBeCalledWith(expect.any(GetMoneyInMachineQuery));
    });
  });
});
