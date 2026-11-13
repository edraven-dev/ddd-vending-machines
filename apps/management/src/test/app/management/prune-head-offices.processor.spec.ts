import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Id } from '@vending-machines/shared';
import { Job } from 'bullmq';
import { DeleteHeadOfficeCommand } from '../../../app/management/commands/impl/delete-head-office.command';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';
import { PruneHeadOfficesProcessor } from '../../../app/management/prune-head-offices.processor';

describe('PruneHeadOfficesProcessor', () => {
  const headOffices = [new HeadOffice(Id.generate()), new HeadOffice(Id.generate())];
  const commandBus = { execute: vi.fn<CommandBus['execute']>() };
  const repository = { findAll: vi.fn<HeadOfficeRepository['findAll']>(() => headOffices) };
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
  });

  describe('#process', () => {
    it('should find all head officess', async () => {
      await processor.process();

      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should call DeleteHeadOfficeCommand for each head office', async () => {
      await processor.process();

      expect(commandBus.execute).toHaveBeenCalledTimes(headOffices.length);
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(DeleteHeadOfficeCommand));
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
