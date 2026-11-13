import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import { LoadCashToAtmHandler } from '../../../../../app/management/commands/handlers/load-cash-to-atm.handler';
import { LoadCashToAtmCommand } from '../../../../../app/management/commands/impl/load-cash-to-atm.command';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { AtmProtoServiceClient } from '../../../../../app/management/proto-clients/atm-proto-service.client';

describe('LoadCashToAtmHandler', () => {
  const headOffice = new HeadOffice(
    Id.generate(),
    [Id.generate(), Id.generate()],
    [Id.generate(), Id.generate()],
    new Date(),
  );
  const [, atmId] = headOffice.atmIds;
  const repository = {
    findOne: vi.fn<HeadOfficeRepository['findOne']>(),
    save: vi.fn<HeadOfficeRepository['save']>(),
  };
  const protoClient = { loadMoney: vi.fn<AtmProtoServiceClient['loadMoney']>() };
  let handler: LoadCashToAtmHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadCashToAtmHandler,
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: AtmProtoServiceClient, useValue: protoClient },
      ],
    }).compile();

    handler = module.get<LoadCashToAtmHandler>(LoadCashToAtmHandler);
  });

  beforeEach(() => {
    repository.findOne.mockImplementation(async () => headOffice);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      const id = headOffice.id;

      await handler.execute(new LoadCashToAtmCommand(id, atmId));

      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException and load nothing if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const id = headOffice.id;

      await expect(handler.execute(new LoadCashToAtmCommand(id, atmId))).rejects.toThrow(
        new NotFoundException(`Head office with id ${id.value} not found`),
      );
      expect(protoClient.loadMoney).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException and load nothing if the ATM is not in the head office', async () => {
      const id = headOffice.id;
      const otherAtmId = Id.generate();

      await expect(handler.execute(new LoadCashToAtmCommand(id, otherAtmId))).rejects.toThrow(
        new NotFoundException(`Atm with id ${otherAtmId.value} not found in head office ${id.value}`),
      );
      expect(protoClient.loadMoney).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should call headOffice.unloadCash', async () => {
      const unloadCash = vi.spyOn(headOffice, 'unloadCash');
      const id = headOffice.id;

      await handler.execute(new LoadCashToAtmCommand(id, atmId));

      expect(unloadCash).toHaveBeenCalledWith();
    });

    it('should call protoClient.loadMoney with the ATM id and the unloaded cash', async () => {
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);
      const id = headOffice.id;

      await handler.execute(new LoadCashToAtmCommand(id, atmId));

      expect(protoClient.loadMoney).toHaveBeenCalledWith({ id: atmId.value, money: [1, 1, 1, 1, 1, 1] });
    });

    it('should call headOfficeRepository.save', async () => {
      const id = headOffice.id;

      await handler.execute(new LoadCashToAtmCommand(id, atmId));

      expect(repository.save).toHaveBeenCalledWith(headOffice);
    });
  });
});
