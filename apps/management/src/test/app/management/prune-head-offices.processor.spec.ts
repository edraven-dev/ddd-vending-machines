import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { DeleteHeadOfficeCommand } from '../../../app/management/commands/impl/delete-head-office.command';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';
import { PruneHeadOfficesProcessor } from '../../../app/management/prune-head-offices.processor';

describe('PruneHeadOfficesProcessor', () => {
  const headOffices = [new HeadOffice(), new HeadOffice()];
  let processor: PruneHeadOfficesProcessor;
  let commandBus: CommandBus;
  let repository: HeadOfficeRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: jest.fn() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PruneHeadOfficesProcessor,
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: HeadOfficeRepository, useValue: { findAll: jest.fn(() => headOffices) } },
        { provide: MikroORM, useValue: orm },
      ],
    }).compile();

    processor = module.get<PruneHeadOfficesProcessor>(PruneHeadOfficesProcessor);
    commandBus = module.get<CommandBus>(CommandBus);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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
      jest.spyOn(Logger, 'debug').mockImplementation(jest.fn());
      const job = { id: 'prune-head-offices', name: 'prune-head-offices', data: {} } as Job;

      processor.onActive(job);

      expect(Logger.debug).toHaveBeenCalledWith(
        `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
      );
    });
  });

  describe('#onFailed', () => {
    it('should log error message', () => {
      jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
      const job = { id: 'prune-head-offices', name: 'prune-head-offices', data: {} } as Job;
      const error = new Error('test');

      processor.onFailed(job, error);

      expect(Logger.error).toHaveBeenCalledWith(
        `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
          job.data,
        )} failed with error: ${error.message}\n${error.stack}`,
      );
    });
  });
});
