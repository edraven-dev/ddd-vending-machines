import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import type { Queue } from 'bullmq';
import { PRUNE_HEAD_OFFICES_QUEUE_NAME } from '../../../app/config/bull.config';
import { ManagementService } from '../../../app/management/management.service';

describe('ManagementService', () => {
  const queue = { upsertJobScheduler: vi.fn<Queue['upsertJobScheduler']>() };
  let service: ManagementService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagementService, { provide: getQueueToken(PRUNE_HEAD_OFFICES_QUEUE_NAME), useValue: queue }],
    }).compile();

    service = module.get<ManagementService>(ManagementService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('#onModuleInit', () => {
    it('should schedule pruneHeadOfficesJob', async () => {
      vi.spyOn(service.constructor.prototype, 'schedulePruneHeadOfficesJob');

      await service.onModuleInit();

      expect(service.constructor.prototype.schedulePruneHeadOfficesJob).toHaveBeenCalled();
    });
  });

  describe('#schedulePruneHeadOfficesJob', () => {
    it('should upsert the prune-head-offices job scheduler with the default cron pattern', async () => {
      vi.stubEnv('PRUNE_HEAD_OFFICES_CRON', undefined);
      const jobSchedulerId = 'prune-head-offices-job';
      const repeatOptions = { pattern: '0 0 * * *' };

      await service.onModuleInit();

      // Exactly these repeat options: the job must wait for the next cron tick instead of running `immediately`.
      expect(queue.upsertJobScheduler).toHaveBeenCalledWith(jobSchedulerId, repeatOptions, {
        name: 'prune-head-offices',
        data: null,
      });
    });

    it('should upsert the prune-head-offices job scheduler with the PRUNE_HEAD_OFFICES_CRON pattern', async () => {
      vi.stubEnv('PRUNE_HEAD_OFFICES_CRON', '0 0 1 * *');
      const jobSchedulerId = 'prune-head-offices-job';
      const repeatOptions = { pattern: '0 0 1 * *' };

      await service.onModuleInit();

      expect(queue.upsertJobScheduler).toHaveBeenCalledWith(jobSchedulerId, repeatOptions, {
        name: 'prune-head-offices',
        data: null,
      });
    });
  });
});
