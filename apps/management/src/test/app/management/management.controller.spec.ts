import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Id } from '@vending-machines/shared';
import { z } from 'zod';
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
    it('should execute CreateHeadOfficeCommand with three distinct new v7 ids', async () => {
      await controller.create();

      expect(commandBus.execute).toHaveBeenCalledOnce();
      const command = commandBus.execute.mock.lastCall?.[0];
      assert(command instanceof CreateHeadOfficeCommand, 'command should be an instance of CreateHeadOfficeCommand');
      const ids = [command.id.value, command.atmId.value, command.snackMachineId.value];
      expect(new Set(ids).size).toBe(3);
      expect(() => z.array(z.uuidv7()).parse(ids)).not.toThrow();
    });

    it('should execute GetHeadOfficeQuery with the new head office id after the command', async () => {
      await controller.create();

      const command = commandBus.execute.mock.lastCall?.[0];
      assert(command instanceof CreateHeadOfficeCommand, 'command should be an instance of CreateHeadOfficeCommand');
      expect(queryBus.execute.mock.lastCall).toStrictEqual([new GetHeadOfficeQuery(command.id)]);
      expect(commandBus.execute.mock.invocationCallOrder[0]).toBeLessThan(queryBus.execute.mock.invocationCallOrder[0]);
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
