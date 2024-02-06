import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue, RepeatableJob } from 'bullmq';
import { PRUNE_HEAD_OFFICES_QUEUE_NAME } from '../../../app/config/bull.config';
import { ManagementService } from '../../../app/management/management.service';

describe('ManagementService', () => {
  let service: ManagementService;
  let queue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagementService,
        {
          provide: getQueueToken(PRUNE_HEAD_OFFICES_QUEUE_NAME),
          useValue: { getRepeatableJobs: jest.fn(() => []), removeRepeatableByKey: jest.fn(), add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ManagementService>(ManagementService);
    queue = module.get<Queue>(getQueueToken(PRUNE_HEAD_OFFICES_QUEUE_NAME));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#onModuleInit', () => {
    it('should schedule pruneHeadOfficesJob', async () => {
      jest.spyOn(service.constructor.prototype, 'schedulePruneHeadOfficesJob');

      await service.onModuleInit();

      expect(service.constructor.prototype.schedulePruneHeadOfficesJob).toHaveBeenCalled();
    });
  });

  describe('#schedulePruneHeadOfficesJob', () => {
    it('should remove existing prune-head-offices job from queue if pattern has changed', async () => {
      const cron = '0 0 * * *';
      const repeatableJobs = [{ id: 'prune-head-offices-job', pattern: '0 0 1 * *' } as RepeatableJob];
      const jobId = 'prune-head-offices-job';
      const pattern = { pattern: cron };

      jest.spyOn(queue, 'getRepeatableJobs').mockResolvedValueOnce(repeatableJobs);

      await service.onModuleInit();

      expect(queue.getRepeatableJobs).toHaveBeenCalled();
      expect(queue.removeRepeatableByKey).toHaveBeenCalledWith(repeatableJobs[0].key);
      expect(queue.add).toHaveBeenCalledWith('prune-head-offices', null, { jobId, repeat: pattern });
    });

    it('should add prune-head-offices job to queue', async () => {
      const cron = '0 0 * * *';
      const repeatableJobs: RepeatableJob[] = [];
      const jobId = 'prune-head-offices-job';
      const pattern = { pattern: cron };

      jest.spyOn(queue, 'getRepeatableJobs').mockResolvedValueOnce(repeatableJobs);

      await service.onModuleInit();

      expect(queue.getRepeatableJobs).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalledWith('prune-head-offices', null, { jobId, repeat: pattern });
    });
  });
});
