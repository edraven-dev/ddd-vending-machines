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
          useValue: {
            flush: vi.fn<EntityManager['flush']>(),
            getReference: vi.fn<EntityManager['getReference']>(),
            remove: vi.fn<() => Pick<EntityManager, 'flush'>>(() => ({ flush: vi.fn<EntityManager['flush']>() })),
          },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmAtmRepository>(MikroOrmAtmRepository);
    ormRepository = module.get<EntityRepository<AtmEntity>>(getRepositoryToken(AtmEntity));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);

      await repository.findOne(atmEntity.id);

      expect(findOne).toHaveBeenCalledWith({ id: atmEntity.id });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const id = randomUUID();

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return Atm if ormRepository.findOne returns AtmEntity', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);

      const result = await repository.findOne(atmEntity.id);

      expect(result).toBeDefined();
      expect(result!).toBeInstanceOf(Atm);
      expect(result!.id).toBe('id');
      expect(result!.moneyInside.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const atmEntity = new AtmEntity();
      vi.spyOn(atmEntity, 'assign').mockReturnThis();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);
      const atm = new Atm();
      Object.assign(atm, { id: 'id', money: Money.Dollar });

      await repository.save(atm);

      expect(findOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const create = vi.spyOn(ormRepository, 'create').mockImplementation(() => new AtmEntity());
      const atm = new Atm();
      Object.assign(atm, { id: 'id', moneyInside: Money.Dollar });

      await repository.save(atm);

      expect(create).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const atmEntity = new AtmEntity();
      vi.spyOn(atmEntity, 'assign').mockReturnThis();
      atmEntity.id = 'id';
      atmEntity.money = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => atmEntity);
      const flush = vi.spyOn(entityManager, 'flush');
      const atm = new Atm();
      Object.assign(atm, { id: 'id', money: Money.Dollar });

      await repository.save(atm);

      expect(flush).toHaveBeenCalled();
    });
  });

  describe('#delete', () => {
    it('should call entityManager.getReference with proper id', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      const getReference = vi.spyOn(entityManager, 'getReference').mockImplementation(() => atmEntity);

      await repository.delete(atmEntity.id);

      expect(getReference).toHaveBeenCalledWith(AtmEntity, 'id');
    });

    it('should call entityManager.remove with reference returned by entityManager.getReference', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      const atmRef = new AtmEntity();
      vi.spyOn(entityManager, 'getReference').mockImplementation(() => atmRef);
      const remove = vi.spyOn(entityManager, 'remove').mockImplementation(() => entityManager);

      await repository.delete(atmEntity.id);

      expect(remove).toHaveBeenCalledWith(atmRef);
    });

    it('should call entityManager.flush', async () => {
      const atmEntity = new AtmEntity();
      atmEntity.id = 'id';
      vi.spyOn(entityManager, 'getReference').mockImplementation(() => atmEntity);
      vi.spyOn(entityManager, 'remove').mockImplementation(() => entityManager);
      const flush = vi.spyOn(entityManager, 'flush').mockImplementation(() => Promise.resolve());

      await repository.delete(atmEntity.id);

      expect(flush).toHaveBeenCalled();
    });
  });
});
