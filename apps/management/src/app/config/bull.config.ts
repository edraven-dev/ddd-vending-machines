import { RegisterQueueOptions, RegisterQueueOptionsFactory, SharedBullConfigurationFactory } from '@nestjs/bullmq';
import { QueueOptions } from 'bullmq';

export const PRUNE_HEAD_OFFICES_QUEUE_NAME = 'prune-head-offices-queue';

export class BullConfig implements SharedBullConfigurationFactory, RegisterQueueOptionsFactory {
  createSharedConfiguration(): QueueOptions {
    return {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: +(process.env.REDIS_PORT || 6379),
      },
    };
  }

  createRegisterQueueOptions(): RegisterQueueOptions {
    return {
      connection: {},
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    };
  }
}
