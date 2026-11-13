import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { Atm } from '../../../app/atm/atm';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';
import { HeadOfficeDeletedHandler } from '../../../app/atm/head-office-deleted.handler';

describe('HeadOfficeDeletedHandler', () => {
  const atm = new Atm(Id.generate());
  const repository = {
    findOne: vi.fn<(id: Id) => Promise<Atm | undefined>>(async () => atm),
    delete: vi.fn<AtmRepository['delete']>(),
  };
  const eventPublisher = { mergeObjectContext: vi.fn<() => Atm>(() => atm) };
  let handler: HeadOfficeDeletedHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfficeDeletedHandler,
        { provide: AtmRepository, useValue: repository },
        { provide: MikroORM, useValue: orm },
        { provide: EventPublisher, useValue: eventPublisher },
      ],
    }).compile();

    handler = module.get<HeadOfficeDeletedHandler>(HeadOfficeDeletedHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call atmRepository.findOne with the parsed id', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(repository.findOne).toHaveBeenCalledWith(Id.from(event.aggregateId));
    });

    it('should log and return early if Atm not found', async () => {
      const error = vi.spyOn(Logger, 'error').mockImplementation(vi.fn());
      const markAsDeleted = vi.spyOn(atm, 'markAsDeleted');
      repository.findOne.mockResolvedValueOnce(undefined);
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(markAsDeleted).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
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
      const markAsDeleted = vi.spyOn(atm, 'markAsDeleted');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(markAsDeleted).toHaveBeenCalled();
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
      const commit = vi.spyOn(atm, 'commit');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(commit).toHaveBeenCalled();
    });
  });
});
