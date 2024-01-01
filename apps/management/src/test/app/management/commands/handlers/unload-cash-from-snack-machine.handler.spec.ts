import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money, UnloadMoneyDto } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { UnloadCashFromSnackMachineHandler } from '../../../../../app/management/commands/handlers/unload-cash-from-snack-machine.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { SnackMachineProtoServiceClient } from '../../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('UnloadCashFromSnackMachineHandler', () => {
  const headOffice = new HeadOffice();
  Object.assign(headOffice, { id: randomUUID() });
  let handler: UnloadCashFromSnackMachineHandler;
  let repository: HeadOfficeRepository;
  let protoClient: SnackMachineProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnloadCashFromSnackMachineHandler,
        { provide: HeadOfficeRepository, useValue: { findOne: jest.fn(async () => headOffice), save: jest.fn() } },
        {
          provide: SnackMachineProtoServiceClient,
          useValue: { unloadMoney: jest.fn(async (): Promise<UnloadMoneyDto> => ({ money: [1, 1, 1, 1, 1, 1] })) },
        },
      ],
    }).compile();

    handler = module.get<UnloadCashFromSnackMachineHandler>(UnloadCashFromSnackMachineHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
    protoClient = module.get<SnackMachineProtoServiceClient>(SnackMachineProtoServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      jest.spyOn(repository, 'findOne');

      await handler.execute({ id: headOffice.id });

      expect(repository.findOne).toHaveBeenCalledWith(headOffice.id);
    });

    it('should throw NotFoundException if HeadOffice not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id: headOffice.id })).rejects.toThrow(NotFoundException);
    });

    it('should call protoClient.unloadMoney with correct data', async () => {
      jest.spyOn(protoClient, 'unloadMoney');

      await handler.execute({ id: headOffice.id });

      expect(protoClient.unloadMoney).toHaveBeenCalledWith(headOffice.id);
    });

    it('should call headOffice.loadCash with correct data', async () => {
      jest.spyOn(headOffice, 'loadCash');

      await handler.execute({ id: headOffice.id });

      expect(headOffice.loadCash).toHaveBeenCalledWith(new Money(1, 1, 1, 1, 1, 1));
    });
  });
});
