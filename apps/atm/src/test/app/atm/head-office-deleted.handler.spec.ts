import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import { Atm } from '../../../app/atm/atm';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';
import { HeadOfficeDeletedHandler } from '../../../app/atm/head-office-deleted.handler';

describe('HeadOfficeDeletedHandler', () => {
  const atm = new Atm();
  let handler: HeadOfficeDeletedHandler;
  let eventPublisher: EventPublisher;
  let repository: AtmRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: jest.fn() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfficeDeletedHandler,
        { provide: AtmRepository, useValue: { findOne: jest.fn(async () => atm), delete: jest.fn() } },
        { provide: MikroORM, useValue: orm },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn(() => atm) } },
      ],
    }).compile();

    handler = module.get<HeadOfficeDeletedHandler>(HeadOfficeDeletedHandler);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
    repository = module.get<AtmRepository>(AtmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call atmRepository.findOne', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should log and return early if Atm not found', async () => {
      jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
      jest.spyOn(atm, 'markAsDeleted');
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(atm.markAsDeleted).not.toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should call eventPublisher.mergeObjectContext', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(eventPublisher.mergeObjectContext).toHaveBeenCalled();
    });

    it('should call atm.markAsDeleted', async () => {
      jest.spyOn(atm, 'markAsDeleted');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(atm.markAsDeleted).toHaveBeenCalled();
    });

    it('should call headOfficeRepository.delete', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(repository.delete).toHaveBeenCalled();
    });

    it('should commit atm events', async () => {
      jest.spyOn(atm, 'commit');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(atm.commit).toHaveBeenCalled();
    });
  });
});
