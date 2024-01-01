import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';
import { AtmService } from '../../../app/atm/atm.service';

describe('AtmService', () => {
  const atm = { id: randomUUID(), loadMoney: jest.fn() };
  let service: AtmService;
  let repository: AtmRepository;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: jest.fn() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtmService,
        { provide: MikroORM, useValue: orm },
        {
          provide: AtmRepository,
          useValue: { findOne: jest.fn(async () => atm), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AtmService>(AtmService);
    repository = module.get<AtmRepository>(AtmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#loadMoney', () => {
    it('should call repository.findOne with correct id', async () => {
      const money = new Money(1, 1, 1, 1, 1, 1);

      await service.loadMoney(atm.id, money);

      expect(repository.findOne).toHaveBeenCalledWith(atm.id);
    });

    it('should throw error if atm not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(null);
      const money = new Money(1, 1, 1, 1, 1, 1);

      await expect(service.loadMoney(atm.id, money)).rejects.toThrow(NotFoundException);
    });

    it('should call atm.loadMoney with correct money', async () => {
      const money = new Money(1, 1, 1, 1, 1, 1);

      await service.loadMoney(atm.id, money);

      expect(atm.loadMoney).toHaveBeenCalledWith(money);
    });

    it('should call repository.save with correct atm', async () => {
      const money = new Money(1, 1, 1, 1, 1, 1);

      await service.loadMoney(atm.id, money);

      expect(repository.save).toHaveBeenCalledWith(atm);
    });
  });
});
