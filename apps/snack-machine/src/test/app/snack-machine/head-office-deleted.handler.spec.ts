import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import { HeadOfficeDeletedHandler } from '../../../app/snack-machine/head-office-deleted.handler';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { Id } from '@vending-machines/shared';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';

describe('HeadOfficeDeletedHandler', () => {
  const snackMachine = new SnackMachine(Id.generate());
  const repositoryMock = {
    findOne: vi.fn<SnackMachineRepository['findOne']>(async () => snackMachine),
    delete: vi.fn<SnackMachineRepository['delete']>(),
  };
  const eventPublisherMock = { mergeObjectContext: vi.fn<() => SnackMachine>(() => snackMachine) };
  let handler: HeadOfficeDeletedHandler;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfficeDeletedHandler,
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: MikroORM, useValue: orm },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    handler = module.get<HeadOfficeDeletedHandler>(HeadOfficeDeletedHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with the parsed id', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(Id.from(event.aggregateId));
    });

    it('should log and return early if Atm not found', async () => {
      const loggerSpy = vi.spyOn(Logger, 'error').mockImplementation(vi.fn());
      const markAsDeletedSpy = vi.spyOn(snackMachine, 'markAsDeleted');
      repositoryMock.findOne.mockResolvedValueOnce(null);
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(markAsDeletedSpy).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should call eventPublisher.mergeObjectContext', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(eventPublisherMock.mergeObjectContext).toHaveBeenCalled();
    });

    it('should call atm.markAsDeleted', async () => {
      const spy = vi.spyOn(snackMachine, 'markAsDeleted');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(spy).toHaveBeenCalled();
    });

    it('should call headOfficeRepository.delete', async () => {
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(repositoryMock.delete).toHaveBeenCalled();
    });

    it('should commit atm events', async () => {
      const spy = vi.spyOn(snackMachine, 'commit');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(spy).toHaveBeenCalled();
    });
  });
});
