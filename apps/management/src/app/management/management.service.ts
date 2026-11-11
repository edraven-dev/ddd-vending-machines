import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PRUNE_HEAD_OFFICES_QUEUE_NAME } from '../config/bull.config';

@Injectable()
export class ManagementService implements OnModuleInit {
  constructor(@InjectQueue(PRUNE_HEAD_OFFICES_QUEUE_NAME) private readonly pruneHeadOfficesQueue: Queue) {}

  async onModuleInit() {
    await this.schedulePruneHeadOfficesJob();
  }

  private async schedulePruneHeadOfficesJob(): Promise<void> {
    const cron = process.env.PRUNE_HEAD_OFFICES_CRON || '0 0 * * *';

    await this.pruneHeadOfficesQueue.upsertJobScheduler(
      'prune-head-offices-job',
      { pattern: cron },
      { name: 'prune-head-offices', data: null },
    );
  }
}
