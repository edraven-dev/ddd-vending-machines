import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { LoadCashToAtmHandler } from '../../../../../app/management/commands/handlers/load-cash-to-atm.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { AtmProtoServiceClient } from '../../../../../app/management/proto-clients/atm-proto-service.client';

describe('LoadCashToAtmHandler', () => {
  const headOffice = new HeadOffice();
  Object.assign(headOffice, { id: randomUUID() });
  let handler: LoadCashToAtmHandler;
  let repository: HeadOfficeRepository;
  let protoClient: AtmProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadCashToAtmHandler,
        { provide: HeadOfficeRepository, useValue: { findOne: jest.fn(async () => headOffice), save: jest.fn() } },
        { provide: AtmProtoServiceClient, useValue: { loadMoney: jest.fn() } },
      ],
    }).compile();

    handler = module.get<LoadCashToAtmHandler>(LoadCashToAtmHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
    protoClient = module.get<AtmProtoServiceClient>(AtmProtoServiceClient);
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

    it('should call headOffice.unloadCash', async () => {
      jest.spyOn(headOffice, 'unloadCash');

      await handler.execute({ id: headOffice.id });

      expect(headOffice.unloadCash).toHaveBeenCalledWith();
    });

    it('should call protoClient.loadMoney with correct data', async () => {
      const headOffice = new HeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);
      jest.spyOn(repository, 'findOne').mockImplementation(async () => headOffice);

      await handler.execute({ id: headOffice.id });

      expect(protoClient.loadMoney).toHaveBeenCalledWith({ id: headOffice.id, money: [1, 1, 1, 1, 1, 1] });
    });
  });
});
