import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { LoadCashToAtmCommand } from '../../../app/management/commands/impl/load-cash-to-atm.command';
import { UnloadCashFromSnackMachineCommand } from '../../../app/management/commands/impl/unload-cash-from-snack-machine.command';
import { ManagementController } from '../../../app/management/management.controller';
import { GetHeadOfficeQuery } from '../../../app/management/queries/impl/get-head-office.query';

describe('ManagementController', () => {
  let controller: ManagementController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ManagementController>(ManagementController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getHeadOffice', () => {
    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.getHeadOffice(id);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetHeadOfficeQuery));
    });
  });

  describe('#loadCashToAtm', () => {
    it('should execute LoadCashToAtmCommand', async () => {
      const id = randomUUID();

      await controller.loadCashToAtm(id);

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(LoadCashToAtmCommand));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.loadCashToAtm(id);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetHeadOfficeQuery));
    });
  });

  describe('#unloadCashFromSnackMachineCommand', () => {
    it('should execute UnloadCashFromSnackMachineCommand', async () => {
      const id = randomUUID();

      await controller.unloadCashFromSnackMachine(id);

      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(UnloadCashFromSnackMachineCommand));
    });

    it('should execute GetHeadOfficeQuery', async () => {
      const id = randomUUID();

      await controller.unloadCashFromSnackMachine(id);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetHeadOfficeQuery));
    });
  });
});
