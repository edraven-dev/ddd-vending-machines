import { MikroORM } from '@mikro-orm/core';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Id } from '@vending-machines/shared';
import { Job } from 'bullmq';
import { DeleteHeadOfficeCommand } from '../../../app/management/commands/impl/delete-head-office.command';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';
import { PruneHeadOfficesProcessor } from '../../../app/management/prune-head-offices.processor';

describe('PruneHeadOfficesProcessor', () => {
  const expiredHeadOffices = [
    new HeadOffice(Id.generate(), Id.generate(), Id.generate(), new Date()),
    new HeadOffice(Id.generate(), Id.generate(), Id.generate(), new Date()),
  ];
  const commandBus = { execute: vi.fn<CommandBus['execute']>() };
  const repository = { findExpired: vi.fn<HeadOfficeRepository['findExpired']>(() => expiredHeadOffices) };
  let processor: PruneHeadOfficesProcessor;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PruneHeadOfficesProcessor,
        { provide: CommandBus, useValue: commandBus },
        { provide: HeadOfficeRepository, useValue: repository },
        { provide: MikroORM, useValue: orm },
      ],
    }).compile();

    processor = module.get<PruneHeadOfficesProcessor>(PruneHeadOfficesProcessor);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('#process', () => {
    it('should find the head offices expired by now', async () => {
      const now = new Date('2026-11-13T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      await processor.process();

      expect(repository.findExpired).toHaveBeenCalledWith(now);
    });

    it('should dispatch one DeleteHeadOfficeCommand per expired head office', async () => {
      await processor.process();

      expect(commandBus.execute.mock.calls).toStrictEqual(
        expiredHeadOffices.map((headOffice) => [new DeleteHeadOfficeCommand(headOffice.id)]),
      );
    });

    it('should warn about a head office that was not pruned and still prune the others', async () => {
      const warn = vi.spyOn(Logger, 'warn').mockImplementation(() => undefined);
      const [failing, pruned] = expiredHeadOffices;
      commandBus.execute.mockRejectedValueOnce(new ServiceUnavailableException());

      await expect(processor.process()).resolves.toBeUndefined();

      expect(commandBus.execute.mock.calls).toStrictEqual([
        [new DeleteHeadOfficeCommand(failing.id)],
        [new DeleteHeadOfficeCommand(pruned.id)],
      ]);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn).toHaveBeenCalledWith(
        `Head office ${failing.id.value} not pruned, retrying on the next run: ServiceUnavailableException: Service Unavailable`,
        'PruneHeadOfficesProcessor',
      );
    });
  });

  describe('#onActive', () => {
    it('should log debug message', () => {
      const loggerDebug = vi.spyOn(Logger, 'debug').mockImplementation(() => undefined);
      const job = { id: 'prune-head-offices', name: 'prune-head-offices', data: {} } as Job;

      processor.onActive(job);

      expect(loggerDebug).toHaveBeenCalledWith(
        `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
      );
    });
  });

  describe('#onFailed', () => {
    it('should log error message', () => {
      const loggerError = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      const job = { id: 'prune-head-offices', name: 'prune-head-offices', data: {} } as Job;
      const error = new Error('test');

      processor.onFailed(job, error);

      expect(loggerError).toHaveBeenCalledWith(
        `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
          job.data,
        )} failed with error: ${error.message}\n${error.stack}`,
      );
    });
  });
});
