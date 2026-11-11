import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { UnloadCashFromSnackMachineHandler } from '../../../../../app/management/commands/handlers/unload-cash-from-snack-machine.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { SnackMachineProtoServiceClient } from '../../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('UnloadCashFromSnackMachineHandler', () => {
  const headOffice = new HeadOffice(randomUUID());
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

      await handler.execute({ id });

      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const id = headOffice.id;

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should call protoClient.unloadMoney with correct data', async () => {
      const id = headOffice.id;

      await handler.execute({ id });

      expect(protoClient.unloadMoney).toHaveBeenCalledWith(id);
    });

    it('should call headOffice.loadCash with correct data', async () => {
      const loadCash = vi.spyOn(headOffice, 'loadCash');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(loadCash).toHaveBeenCalledWith(new Money(1, 1, 1, 1, 1, 1));
    });

    it('should call headOfficeRepository.save', async () => {
      const id = headOffice.id;

      await handler.execute({ id });

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });
  });
});
