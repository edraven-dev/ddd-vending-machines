import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceChangedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { BalanceChangedHandler } from '../../../app/management/balance-changed.handler';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';
import { Inbox } from '../../../app/management/inbox.interface';

describe('BalanceChangedHandler', () => {
  const headOffice = new HeadOffice();
  const repository = {
    findOne: vi.fn<HeadOfficeRepository['findOne']>(async () => headOffice),
    save: vi.fn<HeadOfficeRepository['save']>(),
  };
  const inbox = { tryRecord: vi.fn<Inbox['tryRecord']>(async () => true) };
  let inTransaction = false;
  const transactional = vi.fn<(callback: () => Promise<unknown>) => Promise<unknown>>(async (callback) => {
    inTransaction = true;
    try {
      return await callback();
    } finally {
      inTransaction = false;
    }
  });
  let handler: BalanceChangedHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}), transactional } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceChangedHandler,
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: Inbox, useValue: inbox },
        { provide: MikroORM, useValue: orm },
      ],
    }).compile();

    handler = module.get<BalanceChangedHandler>(BalanceChangedHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should record the event under the handler name, then load and save the head office, all in one transaction', async () => {
      const calls: { call: string; inTransaction: boolean }[] = [];
      inbox.tryRecord.mockImplementationOnce(async () => {
        calls.push({ call: 'tryRecord', inTransaction });
        return true;
      });
      repository.findOne.mockImplementationOnce(async () => {
        calls.push({ call: 'findOne', inTransaction });
        return headOffice;
      });
      repository.save.mockImplementationOnce(async () => {
        calls.push({ call: 'save', inTransaction });
      });
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(transactional).toHaveBeenCalledOnce();
      expect(inbox.tryRecord).toHaveBeenCalledWith('BalanceChangedHandler', event.eventId);
      expect(calls).toEqual([
        { call: 'tryRecord', inTransaction: true },
        { call: 'findOne', inTransaction: true },
        { call: 'save', inTransaction: true },
      ]);
    });

    it('should skip an event that was already processed', async () => {
      inbox.tryRecord.mockResolvedValueOnce(false);
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

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
      const loggerError = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      const changeBalance = vi.spyOn(headOffice, 'changeBalance');
      repository.findOne.mockResolvedValueOnce(null);
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(changeBalance).not.toHaveBeenCalled();
      expect(loggerError).toHaveBeenCalled();
    });

    it('should call headOffice.changeBalance with correct value', async () => {
      const changeBalance = vi.spyOn(headOffice, 'changeBalance');
      const event = new BalanceChangedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: { delta: '1.01' },
      });

      await handler.handle(event);

      expect(changeBalance).toHaveBeenCalledWith(new Currency(event.payload.delta));
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
