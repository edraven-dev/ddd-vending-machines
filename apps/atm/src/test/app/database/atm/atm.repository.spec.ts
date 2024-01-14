import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { Atm } from '../../../../app/atm/atm';
import AtmEntity from '../../../../app/database/atm/atm.entity';
import { MikroOrmAtmRepository } from '../../../../app/database/atm/atm.repository';

describe('MikroOrmAtmRepository', () => {
  let entityManager: EntityManager;
  let repository: MikroOrmAtmRepository;
  let ormRepository: EntityRepository<AtmEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MikroOrmAtmRepository,
        {
          provide: getRepositoryToken(AtmEntity),
          useClass: EntityRepository<AtmEntity>,
        },
        {
          provide: EntityManager,
          useValue: { flush: jest.fn() },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmAtmRepository>(MikroOrmAtmRepository);
    ormRepository = module.get<EntityRepository<AtmEntity>>(getRepositoryToken(AtmEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);

      await repository.findOne(atmEntity.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ id: atmEntity.id });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const id = randomUUID();

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return Atm if ormRepository.findOne returns AtmEntity', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);

      const result = await repository.findOne(atmEntity.id);

      expect(result).toBeInstanceOf(Atm);
      expect(result.id).toBe('id');
      expect(result.moneyInside.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.assign = jest.fn();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);
      const atm = new Atm();
      Object.assign(atm, { id: 'id', money: Money.Dollar });

      await repository.save(atm);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      jest.spyOn(ormRepository, 'create').mockImplementation(() => new AtmEntity());
      const atm = new Atm();
      Object.assign(atm, { id: 'id', moneyInside: Money.Dollar });

      await repository.save(atm);

      expect(ormRepository.create).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.assign = jest.fn();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);
      const atm = new Atm();
      Object.assign(atm, { id: 'id', money: Money.Dollar });

      await repository.save(atm);

      expect(entityManager.flush).toHaveBeenCalled();
    });
  });
});
