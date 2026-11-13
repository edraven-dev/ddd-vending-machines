import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import type { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineService', () => {
  const snackMachine = {
    id: Id.generate(),
    unloadMoney: vi.fn<SnackMachine['unloadMoney']>(() => Money.TwentyDollar),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  const repositoryMock = {
    findOne: vi.fn<() => Promise<typeof snackMachine | null>>(async () => snackMachine),
    save: vi.fn<SnackMachineRepository['save']>(),
  };
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine),
  };
  let service: SnackMachineService;

  beforeAll(async () => {
    const orm = Object.setPrototypeOf({ em: { name: 'default', fork: () => ({}) } }, MikroORM.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnackMachineService,
        { provide: MikroORM, useValue: orm },
        { provide: SnackMachineRepository, useValue: repositoryMock },
        { provide: EventPublisher, useValue: eventPublisherMock },
      ],
    }).compile();

    service = module.get<SnackMachineService>(SnackMachineService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#unloadMoney', () => {
    it('should call repository.findOne with correct id', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw error if snackMachine not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);

      await expect(service.unloadMoney(snackMachine.id)).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.unloadMoney', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.unloadMoney).toHaveBeenCalled();
    });

    it('should call repository.save with proper data', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(repositoryMock.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
