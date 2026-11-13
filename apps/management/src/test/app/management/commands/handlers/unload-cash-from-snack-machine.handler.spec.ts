import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import { UnloadCashFromSnackMachineHandler } from '../../../../../app/management/commands/handlers/unload-cash-from-snack-machine.handler';
import { UnloadCashFromSnackMachineCommand } from '../../../../../app/management/commands/impl/unload-cash-from-snack-machine.command';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { SnackMachineProtoServiceClient } from '../../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('UnloadCashFromSnackMachineHandler', () => {
  const headOffice = new HeadOffice(
    Id.generate(),
    [Id.generate(), Id.generate()],
    [Id.generate(), Id.generate()],
    new Date(),
  );
  const [, snackMachineId] = headOffice.snackMachineIds;
  const repository = {
    findOne: vi.fn<HeadOfficeRepository['findOne']>(async () => headOffice),
    save: vi.fn<HeadOfficeRepository['save']>(),
  };
  const protoClient = {
    unloadMoney: vi.fn<SnackMachineProtoServiceClient['unloadMoney']>(async () => ({ money: [1, 1, 1, 1, 1, 1] })),
  };
  let handler: UnloadCashFromSnackMachineHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnloadCashFromSnackMachineHandler,
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: SnackMachineProtoServiceClient, useValue: protoClient },
      ],
    }).compile();

    handler = module.get<UnloadCashFromSnackMachineHandler>(UnloadCashFromSnackMachineHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      const id = headOffice.id;

      await handler.execute(new UnloadCashFromSnackMachineCommand(id, snackMachineId));

      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException and unload nothing if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const id = headOffice.id;

      await expect(handler.execute(new UnloadCashFromSnackMachineCommand(id, snackMachineId))).rejects.toThrow(
        new NotFoundException(`Head office with id ${id.value} not found`),
      );
      expect(protoClient.unloadMoney).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException and unload nothing if the snack machine is not in the head office', async () => {
      const id = headOffice.id;
      const otherSnackMachineId = Id.generate();

      await expect(handler.execute(new UnloadCashFromSnackMachineCommand(id, otherSnackMachineId))).rejects.toThrow(
        new NotFoundException(
          `Snack machine with id ${otherSnackMachineId.value} not found in head office ${id.value}`,
        ),
      );
      expect(protoClient.unloadMoney).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should call protoClient.unloadMoney with the snack machine id', async () => {
      const id = headOffice.id;

      await handler.execute(new UnloadCashFromSnackMachineCommand(id, snackMachineId));

      expect(protoClient.unloadMoney).toHaveBeenCalledWith(snackMachineId.value);
    });

    it('should call headOffice.loadCash with correct data', async () => {
      const loadCash = vi.spyOn(headOffice, 'loadCash');
      const id = headOffice.id;

      await handler.execute(new UnloadCashFromSnackMachineCommand(id, snackMachineId));

      expect(loadCash).toHaveBeenCalledWith(new Money(1, 1, 1, 1, 1, 1));
    });

    it('should call headOfficeRepository.save', async () => {
      const id = headOffice.id;

      await handler.execute(new UnloadCashFromSnackMachineCommand(id, snackMachineId));

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });
  });
});
