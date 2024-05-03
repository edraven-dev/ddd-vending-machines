import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { LoadCashToAtmHandler } from '../../../../../app/management/commands/handlers/load-cash-to-atm.handler';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { AtmProtoServiceClient } from '../../../../../app/management/proto-clients/atm-proto-service.client';

describe('LoadCashToAtmHandler', () => {
  const headOffice = new HeadOffice(randomUUID());
  let handler: LoadCashToAtmHandler;
  let repository: HeadOfficeRepository;
  let protoClient: AtmProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadCashToAtmHandler,
        { provide: HeadOfficeRepository, useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: AtmProtoServiceClient, useValue: { loadMoney: jest.fn() } },
      ],
    }).compile();

    handler = module.get<LoadCashToAtmHandler>(LoadCashToAtmHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
    protoClient = module.get<AtmProtoServiceClient>(AtmProtoServiceClient);
  });

  beforeEach(() => {
    jest.spyOn(repository, 'findOne').mockImplementation(async () => headOffice);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      jest.spyOn(repository, 'findOne');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if HeadOffice not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const id = headOffice.id;

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should call headOffice.unloadCash', async () => {
      jest.spyOn(headOffice, 'unloadCash');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(headOffice.unloadCash).toHaveBeenCalledWith();
    });

    it('should call protoClient.loadMoney with correct data', async () => {
      const headOffice = new HeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);
      jest.spyOn(repository, 'findOne').mockImplementation(async () => headOffice);
      const id = headOffice.id;

      await handler.execute({ id });

      expect(protoClient.loadMoney).toHaveBeenCalledWith({ id, money: [1, 1, 1, 1, 1, 1] });
    });

    it('should call headOfficeRepository.save', async () => {
      jest.spyOn(repository, 'save');
      const id = headOffice.id;

      await handler.execute({ id });

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });
  });
});
