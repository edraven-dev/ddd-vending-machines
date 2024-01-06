import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineService', () => {
  const snackMachine = { id: randomUUID(), unloadMoney: jest.fn(() => Money.TwentyDollar), commit: jest.fn() };
  let service: SnackMachineService;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: jest.fn() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnackMachineService,
        { provide: MikroORM, useValue: orm },
        {
          provide: SnackMachineRepository,
          useValue: { findOne: jest.fn(async () => snackMachine), save: jest.fn() },
        },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((snackMachine) => snackMachine) } },
      ],
    }).compile();

    service = module.get<SnackMachineService>(SnackMachineService);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#unloadMoney', () => {
    it('should call repository.findOne with correct id', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(repository.findOne).toHaveBeenCalledWith(snackMachine.id);
    });

    it('should throw error if snackMachine not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.unloadMoney(snackMachine.id)).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.unloadMoney', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.unloadMoney).toHaveBeenCalled();
    });

    it('should call repository.save with proper data', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(repository.save).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      await service.unloadMoney(snackMachine.id);

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
