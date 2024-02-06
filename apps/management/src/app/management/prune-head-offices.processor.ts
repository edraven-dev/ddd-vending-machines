import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';

import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { PRUNE_HEAD_OFFICES_QUEUE_NAME } from '../config/bull.config';
import { DeleteHeadOfficeCommand } from './commands/impl/delete-head-office.command';
import { HeadOfficeRepository } from './head-office.repository.interface';

@Processor(PRUNE_HEAD_OFFICES_QUEUE_NAME)
export class PruneHeadOfficesProcessor extends WorkerHost {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly commandBus: CommandBus,
    private readonly headOfficeRepository: HeadOfficeRepository,
  ) {
    super();
  }

  @CreateRequestContext()
  async process(): Promise<void> {
    const headOffices = await this.headOfficeRepository.findAll();

    await Promise.allSettled(
      headOffices.map((headOffice) => this.commandBus.execute(new DeleteHeadOfficeCommand(headOffice.id))),
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job): void {
    Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    Logger.error(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )} failed with error: ${error.message}\n${error.stack}`,
    );
  }
}
