import { GatewayTimeoutException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id } from '@vending-machines/shared';
import { CreateHeadOfficeHandler } from '../../../../../app/management/commands/handlers/create-head-office.handler';
import { CreateHeadOfficeCommand } from '../../../../../app/management/commands/impl/create-head-office.command';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeFactory } from '../../../../../app/management/head-office.factory';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { AtmProtoServiceClient } from '../../../../../app/management/proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from '../../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('CreateHeadOfficeHandler', () => {
  const id = Id.generate();
  const atmId = Id.generate();
  const snackMachineId = Id.generate();
  const command = new CreateHeadOfficeCommand(id, atmId, snackMachineId);
  const expiresAt = new Date('2026-11-14T12:00:00.000Z');
  const now = new Date('2026-11-13T12:00:00.000Z');
  const savedExpiresAt: Date[] = [];
  let headOffice: HeadOffice;
  const factory = { create: vi.fn<HeadOfficeFactory['create']>(() => headOffice) };
  const repository = {
    save: vi.fn<HeadOfficeRepository['save']>((saved) => {
      savedExpiresAt.push(saved.expiresAt);
    }),
  };
  const atmClient = { createAtm: vi.fn<AtmProtoServiceClient['createAtm']>(async () => undefined) };
  const snackMachineClient = {
    createSnackMachine: vi.fn<SnackMachineProtoServiceClient['createSnackMachine']>(async () => undefined),
  };
  let handler: CreateHeadOfficeHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHeadOfficeHandler,
        { provide: HeadOfficeFactory, useValue: factory },
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: AtmProtoServiceClient, useValue: atmClient },
        { provide: SnackMachineProtoServiceClient, useValue: snackMachineClient },
      ],
    }).compile();

    handler = module.get<CreateHeadOfficeHandler>(CreateHeadOfficeHandler);
  });

  beforeEach(() => {
    headOffice = new HeadOffice(id, [atmId], [snackMachineId], expiresAt);
    savedExpiresAt.length = 0;
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('#execute', () => {
    it('should create the head office with its ATM and snack machine, save and commit it, then create both machines', async () => {
      const commit = vi.spyOn(headOffice, 'commit');

      await handler.execute(command);

      expect(factory.create.mock.calls).toStrictEqual([[id, [atmId], [snackMachineId]]]);
      expect(repository.save.mock.calls).toStrictEqual([[headOffice]]);
      expect(commit).toHaveBeenCalledOnce();
      expect(atmClient.createAtm.mock.calls).toStrictEqual([[atmId.value]]);
      expect(snackMachineClient.createSnackMachine.mock.calls).toStrictEqual([[snackMachineId.value]]);
      expect(headOffice.expiresAt).toStrictEqual(expiresAt);
    });

    it('should save and commit the head office before creating its machines', async () => {
      const commit = vi.spyOn(headOffice, 'commit');

      await handler.execute(command);

      const [saveOrder] = repository.save.mock.invocationCallOrder;
      const [commitOrder] = commit.mock.invocationCallOrder;
      expect(saveOrder).toBeLessThan(commitOrder);
      expect(commitOrder).toBeLessThan(atmClient.createAtm.mock.invocationCallOrder[0]);
      expect(commitOrder).toBeLessThan(snackMachineClient.createSnackMachine.mock.invocationCallOrder[0]);
    });

    it('should still create the snack machine, then expire the head office, save it again and rethrow if the ATM create fails', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const error = new ServiceUnavailableException();
      atmClient.createAtm.mockRejectedValueOnce(error);

      await expect(handler.execute(command)).rejects.toBe(error);
      expect(snackMachineClient.createSnackMachine.mock.calls).toStrictEqual([[snackMachineId.value]]);
      expect(repository.save.mock.calls).toStrictEqual([[headOffice], [headOffice]]);
      const [, expiresAtOnSecondSave] = savedExpiresAt;
      expect(expiresAtOnSecondSave.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it('should still create the ATM, then expire the head office, save it again and rethrow if the snack machine create fails', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const error = new GatewayTimeoutException();
      snackMachineClient.createSnackMachine.mockRejectedValueOnce(error);

      await expect(handler.execute(command)).rejects.toBe(error);
      expect(atmClient.createAtm.mock.calls).toStrictEqual([[atmId.value]]);
      expect(repository.save.mock.calls).toStrictEqual([[headOffice], [headOffice]]);
      const [, expiresAtOnSecondSave] = savedExpiresAt;
      expect(expiresAtOnSecondSave.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it('should rethrow the ATM failure if both machine creates fail', async () => {
      const atmError = new ServiceUnavailableException();
      atmClient.createAtm.mockRejectedValueOnce(atmError);
      snackMachineClient.createSnackMachine.mockRejectedValueOnce(new GatewayTimeoutException());

      await expect(handler.execute(command)).rejects.toBe(atmError);
      expect(repository.save).toHaveBeenCalledTimes(2);
    });

    it('should wait for both machine creates to settle before expiring the head office', async () => {
      const error = new ServiceUnavailableException();
      atmClient.createAtm.mockRejectedValueOnce(error);
      let finishSnackMachineCreate: () => void = () => undefined;
      snackMachineClient.createSnackMachine.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishSnackMachineCreate = resolve;
        }),
      );

      const execution = handler.execute(command).catch((reason: unknown) => reason);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(savedExpiresAt).toStrictEqual([expiresAt]);
      finishSnackMachineCreate();
      await expect(execution).resolves.toBe(error);
      expect(savedExpiresAt).toHaveLength(2);
    });
  });
});
