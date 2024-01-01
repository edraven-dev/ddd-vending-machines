import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceChangedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { BalanceChangedHandler } from '../../../app/management/balance-changed.handler';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';

describe('BalanceChangedHandler', () => {
  const headOffice = new HeadOffice();
  let handler: BalanceChangedHandler;
  let repository: HeadOfficeRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceChangedHandler,
        { provide: HeadOfficeRepository, useValue: { findOne: jest.fn(async () => headOffice), save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<BalanceChangedHandler>(BalanceChangedHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call headOfficeRepository.findOne', async () => {
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should log and return early if HeadOffice not found', async () => {
      jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
      jest.spyOn(headOffice, 'changeBalance');
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(headOffice.changeBalance).not.toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should call headOffice.changeBalance with correct value', async () => {
      jest.spyOn(headOffice, 'changeBalance');
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(headOffice.changeBalance).toHaveBeenCalledWith(new Currency(event.payload.delta));
    });

    it('should call headOfficeRepository.save', async () => {
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(repository.save).toHaveBeenCalled();
    });
  });
});
