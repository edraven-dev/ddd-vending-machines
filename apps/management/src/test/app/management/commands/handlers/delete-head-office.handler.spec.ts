import { MikroORM } from '@mikro-orm/core';
import { GatewayTimeoutException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { DeleteHeadOfficeHandler } from '../../../../../app/management/commands/handlers/delete-head-office.handler';
import { DeleteHeadOfficeCommand } from '../../../../../app/management/commands/impl/delete-head-office.command';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { AtmProtoServiceClient } from '../../../../../app/management/proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from '../../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('DeleteHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(
    Id.generate(),
    [Id.generate(), Id.generate()],
    [Id.generate(), Id.generate()],
    new Date(),
  );
  const [firstAtmId, secondAtmId] = headOffice.atmIds;
  const [firstSnackMachineId, secondSnackMachineId] = headOffice.snackMachineIds;
  const repository = {
    findOne: vi.fn<HeadOfficeRepository['findOne']>(async () => headOffice),
    delete: vi.fn<HeadOfficeRepository['delete']>(),
  };
  const eventPublisher = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((headOffice) => headOffice),
  };
  const atmClient = { deleteAtm: vi.fn<AtmProtoServiceClient['deleteAtm']>(async () => undefined) };
  const snackMachineClient = {
    deleteSnackMachine: vi.fn<SnackMachineProtoServiceClient['deleteSnackMachine']>(async () => undefined),
  };
  const failingFor = (failingId: Id, error: Error) => async (id: string) => {
    if (id === failingId.value) {
      throw error;
    }
  };
  let handler: DeleteHeadOfficeHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteHeadOfficeHandler,
        { provide: MikroORM, useValue: orm },
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: EventPublisher, useValue: eventPublisher },
        { provide: AtmProtoServiceClient, useValue: atmClient },
        { provide: SnackMachineProtoServiceClient, useValue: snackMachineClient },
      ],
    }).compile();

    handler = module.get<DeleteHeadOfficeHandler>(DeleteHeadOfficeHandler);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOfficeRepository.findOne with proper id', async () => {
      vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await handler.execute(new DeleteHeadOfficeCommand(headOffice.id));

      expect(repository.findOne).toHaveBeenCalledWith(headOffice.id);
    });

    it('should throw NotFoundException and delete nothing if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toThrow(NotFoundException);
      expect(atmClient.deleteAtm).not.toHaveBeenCalled();
      expect(snackMachineClient.deleteSnackMachine).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should delete every ATM and every snack machine, then apply HeadOfficeDeletedEvent, delete the head office and commit', async () => {
      const apply = vi.spyOn(headOffice, 'apply');
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await handler.execute(new DeleteHeadOfficeCommand(headOffice.id));

      expect(atmClient.deleteAtm.mock.calls).toStrictEqual([[firstAtmId.value], [secondAtmId.value]]);
      expect(snackMachineClient.deleteSnackMachine.mock.calls).toStrictEqual([
        [firstSnackMachineId.value],
        [secondSnackMachineId.value],
      ]);
      expect(apply).toHaveBeenCalledWith(expect.any(HeadOfficeDeletedEvent));
      expect(repository.delete).toHaveBeenCalledWith(headOffice.id);
      expect(repository.delete.mock.invocationCallOrder[0]).toBeLessThan(commit.mock.invocationCallOrder[0]);
    });

    it('should rethrow a failed ATM delete and keep the head office, after still deleting every other machine', async () => {
      const error = new ServiceUnavailableException();
      atmClient.deleteAtm.mockImplementation(failingFor(firstAtmId, error));
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toBe(error);
      expect(atmClient.deleteAtm.mock.calls).toStrictEqual([[firstAtmId.value], [secondAtmId.value]]);
      expect(snackMachineClient.deleteSnackMachine.mock.calls).toStrictEqual([
        [firstSnackMachineId.value],
        [secondSnackMachineId.value],
      ]);
      expect(repository.delete).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should rethrow a failed snack machine delete and keep the head office, after still deleting every other machine', async () => {
      const error = new GatewayTimeoutException();
      snackMachineClient.deleteSnackMachine.mockImplementation(failingFor(secondSnackMachineId, error));
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toBe(error);
      expect(atmClient.deleteAtm.mock.calls).toStrictEqual([[firstAtmId.value], [secondAtmId.value]]);
      expect(snackMachineClient.deleteSnackMachine.mock.calls).toStrictEqual([
        [firstSnackMachineId.value],
        [secondSnackMachineId.value],
      ]);
      expect(repository.delete).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should wait for every machine delete before failing', async () => {
      const error = new ServiceUnavailableException();
      atmClient.deleteAtm.mockRejectedValueOnce(error);
      let finishSnackMachineDelete: () => void = () => undefined;
      snackMachineClient.deleteSnackMachine.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishSnackMachineDelete = resolve;
        }),
      );
      let failed = false;

      const execution = handler.execute(new DeleteHeadOfficeCommand(headOffice.id)).catch((reason: unknown) => {
        failed = true;
        return reason;
      });
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(failed).toBe(false);
      finishSnackMachineDelete();
      await expect(execution).resolves.toBe(error);
    });

    it('should rethrow the first failure in machine order, ATMs first, if several machine deletes fail', async () => {
      const atmError = new ServiceUnavailableException();
      atmClient.deleteAtm.mockImplementation(failingFor(secondAtmId, atmError));
      snackMachineClient.deleteSnackMachine.mockImplementation(
        failingFor(firstSnackMachineId, new GatewayTimeoutException()),
      );
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toBe(atmError);
      expect(repository.delete).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
    });

    it('should not commit when the head office delete fails', async () => {
      repository.delete.mockRejectedValueOnce(new Error('connection lost'));
      const commit = vi.spyOn(headOffice, 'commit').mockResolvedValue();

      await expect(handler.execute(new DeleteHeadOfficeCommand(headOffice.id))).rejects.toThrow('connection lost');
      expect(commit).not.toHaveBeenCalled();
    });
  });
});
