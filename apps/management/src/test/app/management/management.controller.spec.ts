import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Id } from '@vending-machines/shared';
import { CreateHeadOfficeCommand } from '../../../app/management/commands/impl/create-head-office.command';
import { LoadCashToAtmCommand } from '../../../app/management/commands/impl/load-cash-to-atm.command';
import { UnloadCashFromSnackMachineCommand } from '../../../app/management/commands/impl/unload-cash-from-snack-machine.command';
import { ManagementController } from '../../../app/management/management.controller';
import { GetHeadOfficeQuery } from '../../../app/management/queries/impl/get-head-office.query';

describe('ManagementController', () => {
  const commandBus = { execute: vi.fn<CommandBus['execute']>() };
  const queryBus = { execute: vi.fn<QueryBus['execute']>() };
  let controller: ManagementController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get<ManagementController>(ManagementController);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#getById', () => {
    it('should execute GetHeadOfficeQuery', async () => {
      const id = Id.generate();

      await controller.getById(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });

  describe('#create', () => {
    it('should execute CreateHeadOfficeCommand', async () => {
      const id = Id.generate();

      await controller.create({ id });

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateHeadOfficeCommand(id));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = Id.generate();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });

  describe('#loadCashToAtm', () => {
    it('should execute LoadCashToAtmCommand with the head office id and the ATM id', async () => {
      const id = Id.generate();
      const atmId = Id.generate();

      await controller.loadCashToAtm(id, atmId);

      expect(commandBus.execute.mock.lastCall).toStrictEqual([new LoadCashToAtmCommand(id, atmId)]);
    });

    it('should execute GetHeadOfficeQuery after the command', async () => {
      const id = Id.generate();

      await controller.loadCashToAtm(id, Id.generate());

      expect(queryBus.execute.mock.lastCall).toStrictEqual([new GetHeadOfficeQuery(id)]);
      expect(commandBus.execute.mock.invocationCallOrder[0]).toBeLessThan(queryBus.execute.mock.invocationCallOrder[0]);
    });
  });

  describe('#unloadCashFromSnackMachine', () => {
    it('should execute UnloadCashFromSnackMachineCommand with the head office id and the snack machine id', async () => {
      const id = Id.generate();
      const snackMachineId = Id.generate();

      await controller.unloadCashFromSnackMachine(id, snackMachineId);

      expect(commandBus.execute.mock.lastCall).toStrictEqual([
        new UnloadCashFromSnackMachineCommand(id, snackMachineId),
      ]);
    });

    it('should execute GetHeadOfficeQuery after the command', async () => {
      const id = Id.generate();

      await controller.unloadCashFromSnackMachine(id, Id.generate());

      expect(queryBus.execute.mock.lastCall).toStrictEqual([new GetHeadOfficeQuery(id)]);
      expect(commandBus.execute.mock.invocationCallOrder[0]).toBeLessThan(queryBus.execute.mock.invocationCallOrder[0]);
    });
  });
});
