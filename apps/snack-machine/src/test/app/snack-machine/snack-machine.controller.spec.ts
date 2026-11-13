import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CoinsAndNotes, Id, Money } from '@vending-machines/shared';
import { BuySnackCommand } from '../../../app/snack-machine/commands/impl/buy-snack.command';
import { CreateSnackMachineCommand } from '../../../app/snack-machine/commands/impl/create-snack-machine.command';
import { InsertMoneyCommand } from '../../../app/snack-machine/commands/impl/insert-money.command';
import { LoadSnacksCommand } from '../../../app/snack-machine/commands/impl/load-snacks.command';
import { ReturnMoneyCommand } from '../../../app/snack-machine/commands/impl/return-money.command';
import { GetMoneyInMachineQuery } from '../../../app/snack-machine/queries/impl/get-money-in-machine.query';
import { GetSnackMachineQuery } from '../../../app/snack-machine/queries/impl/get-snack-machine.query';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineController', () => {
  const service = { unloadMoney: vi.fn<SnackMachineService['unloadMoney']>() };
  const commandBus = { execute: vi.fn<CommandBus['execute']>() };
  const queryBus = { execute: vi.fn<QueryBus['execute']>() };
  let controller: SnackMachineController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
        { provide: SnackMachineService, useValue: service },
      ],
    }).compile();

    controller = module.get<SnackMachineController>(SnackMachineController);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#getById', () => {
    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#create', () => {
    it('should execute CreateSnackMachineCommand', async () => {
      const id = Id.generate();

      await controller.create({ id });

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateSnackMachineCommand(id));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#insertMoney', () => {
    it('should execute InsertMoneyCommand with proper data', async () => {
      const id = Id.generate();
      const money: CoinsAndNotes = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new InsertMoneyCommand(id, new Money(...money)));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();
      const money: CoinsAndNotes = [1, 0, 0, 0, 0, 0];

      await controller.insertMoney({ money }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#buySnack', () => {
    it('should execute BuySnackCommand', async () => {
      const id = Id.generate();

      await controller.buySnack({ position: 1 }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new BuySnackCommand(id, 1));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();

      await controller.buySnack({ position: 1 }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#returnMoney', () => {
    it('should execute ReturnMoneyCommand', async () => {
      const id = Id.generate();

      await controller.returnMoney(id);

      expect(commandBus.execute).toHaveBeenCalledWith(new ReturnMoneyCommand(id));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();

      await controller.returnMoney(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#getMoneyInMachine', () => {
    it('should execute GetMoneyInMachineQuery', async () => {
      const id = Id.generate();

      await controller.getMoneyInMachine(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetMoneyInMachineQuery(id));
    });
  });

  describe('#loadSnacks', () => {
    it('should execute LoadSnacksCommand', async () => {
      const id = Id.generate();
      const position = 1;
      const quantity = 10;

      await controller.loadSnacks({ position, quantity }, id);

      expect(commandBus.execute).toHaveBeenCalledWith(new LoadSnacksCommand(id, position, quantity));
    });

    it('should execute GetSnackMachineQuery', async () => {
      const id = Id.generate();
      const position = 1;
      const quantity = 10;

      await controller.loadSnacks({ position, quantity }, id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetSnackMachineQuery(id));
    });
  });

  describe('#unloadMoney', () => {
    it('should execute SnackMachineService.unloadMoney', async () => {
      const id = Id.generate();

      await controller.unloadMoney({ id });

      expect(service.unloadMoney).toHaveBeenCalledWith(id);
    });
  });
});
