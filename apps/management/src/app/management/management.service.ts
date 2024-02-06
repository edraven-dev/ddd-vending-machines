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
    const jobId = 'prune-head-offices-job';
    const cron = process.env.PRUNE_HEAD_OFFICES_CRON || '0 0 * * *';
    const repeatableJobs = await this.pruneHeadOfficesQueue.getRepeatableJobs();
    const pruneHeadOfficesJob = repeatableJobs.filter((job) => job.id === jobId).pop();
    if (pruneHeadOfficesJob && pruneHeadOfficesJob.pattern !== cron) {
      await this.pruneHeadOfficesQueue.removeRepeatableByKey(pruneHeadOfficesJob.key);
    }
    await this.pruneHeadOfficesQueue.add('prune-head-offices', null, { jobId, repeat: { pattern: cron } });
  }
}
