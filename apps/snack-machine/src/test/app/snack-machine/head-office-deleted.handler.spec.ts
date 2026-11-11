import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeDeletedEvent } from '@vending-machines/events';
import { randomUUID } from 'crypto';
import { HeadOfficeDeletedHandler } from '../../../app/snack-machine/head-office-deleted.handler';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';

describe('HeadOfficeDeletedHandler', () => {
  const snackMachine = new SnackMachine();
  let handler: HeadOfficeDeletedHandler;
  let eventPublisher: EventPublisher;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: vi.fn<MikroORM['em']['fork']>() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfficeDeletedHandler,
        {
          provide: SnackMachineRepository,
          useValue: {
            findOne: vi.fn<SnackMachineRepository['findOne']>(async () => snackMachine),
            delete: vi.fn<SnackMachineRepository['delete']>(),
          },
        },
        { provide: MikroORM, useValue: orm },
        { provide: EventPublisher, useValue: { mergeObjectContext: vi.fn<() => SnackMachine>(() => snackMachine) } },
      ],
    }).compile();

    handler = module.get<HeadOfficeDeletedHandler>(HeadOfficeDeletedHandler);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call atmRepository.findOne', async () => {
      const spy = vi.spyOn(repository, 'findOne');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(spy).toHaveBeenCalled();
    });

    it('should log and return early if Atm not found', async () => {
      const loggerSpy = vi.spyOn(Logger, 'error').mockImplementation(vi.fn());
      const markAsDeletedSpy = vi.spyOn(snackMachine, 'markAsDeleted');
      vi.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
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
      const spy = vi.spyOn(eventPublisher, 'mergeObjectContext');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(spy).toHaveBeenCalled();
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
      const spy = vi.spyOn(repository, 'delete');
      const event = new HeadOfficeDeletedEvent({
        aggregateId: randomUUID(),
        aggregateType: 'Atm',
        payload: {},
      });

      await handler.handle(event);

      expect(spy).toHaveBeenCalled();
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
