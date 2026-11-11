import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import type { Atm } from '../../../app/atm/atm';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';
import { AtmService } from '../../../app/atm/atm.service';

describe('AtmService', () => {
  const atm = { id: randomUUID(), loadMoney: vi.fn<Atm['loadMoney']>(), commit: vi.fn<Atm['commit']>() };
  const repository = {
    findOne: vi.fn<(id: string) => Promise<typeof atm | null>>(async () => atm),
    save: vi.fn<AtmRepository['save']>(),
  };
  const eventPublisher = { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((atm) => atm) };
  let service: AtmService;

  beforeAll(async () => {
    const orm = Object.create(MikroORM.prototype);
    Object.assign(orm, { em: { name: 'default', fork: vi.fn<MikroORM['em']['fork']>() } });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtmService,
        { provide: MikroORM, useValue: orm },
        { provide: AtmRepository, useValue: repository },
        { provide: EventPublisher, useValue: eventPublisher },
      ],
    }).compile();

    service = module.get<AtmService>(AtmService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#loadMoney', () => {
    it('should call repository.findOne with correct id', async () => {
      const money = new Money(1, 1, 1, 1, 1, 1);

      await service.loadMoney(atm.id, money);

      expect(repository.findOne).toHaveBeenCalledWith(atm.id);
    });

    it('should throw error if atm not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
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
