import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import type { Mock } from 'vitest';
import type { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineService', () => {
  const snackMachine = {
    id: randomUUID(),
    unloadMoney: vi.fn<SnackMachine['unloadMoney']>(() => Money.TwentyDollar),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  let service: SnackMachineService;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: vi.fn<MikroORM['em']['fork']>() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnackMachineService,
        { provide: MikroORM, useValue: orm },
        {
          provide: SnackMachineRepository,
          useValue: {
            findOne: vi.fn<() => Promise<typeof snackMachine>>(async () => snackMachine),
            save: vi.fn<SnackMachineRepository['save']>(),
          },
        },
        {
          provide: EventPublisher,
          useValue: { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine) },
        },
      ],
    }).compile();

    service = module.get<SnackMachineService>(SnackMachineService);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#unloadMoney', () => {
    it('should call repository.findOne with correct id', async () => {
      const spy = vi.spyOn(repository, 'findOne');

      await service.unloadMoney(snackMachine.id);

      expect(spy).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw error if snackMachine not found', async () => {
      (repository.findOne as Mock).mockResolvedValueOnce(null);

      await expect(service.unloadMoney(snackMachine.id)).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.unloadMoney', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.unloadMoney).toHaveBeenCalled();
    });

    it('should call repository.save with proper data', async () => {
      const spy = vi.spyOn(repository, 'save');

      await service.unloadMoney(snackMachine.id);

      expect(spy).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
