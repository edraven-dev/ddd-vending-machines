import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
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
      const id = randomUUID();

      await controller.getById(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });

  describe('#create', () => {
    it('should execute CreateHeadOfficeCommand', async () => {
      const id = randomUUID();

      await controller.create({ id });

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateHeadOfficeCommand(id));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.create({ id });

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });

  describe('#loadCashToAtm', () => {
    it('should execute LoadCashToAtmCommand', async () => {
      const id = randomUUID();

      await controller.loadCashToAtm(id);

      expect(commandBus.execute).toHaveBeenCalledWith(new LoadCashToAtmCommand(id));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.loadCashToAtm(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });

  describe('#unloadCashFromSnackMachineCommand', () => {
    it('should execute UnloadCashFromSnackMachineCommand', async () => {
      const id = randomUUID();

      await controller.unloadCashFromSnackMachine(id);

      expect(commandBus.execute).toHaveBeenCalledWith(new UnloadCashFromSnackMachineCommand(id));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.unloadCashFromSnackMachine(id);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetHeadOfficeQuery(id));
    });
  });
});
