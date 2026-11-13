import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import HeadOfficeEntity from '../../../../app/database/management/head-office.entity';
import { MikroOrmHeadOfficeRepository } from '../../../../app/database/management/head-office.repository';
import { HeadOffice } from '../../../../app/management/head-office';

describe('MikroOrmHeadOfficeRepository', () => {
  const id = Id.generate();
  const entityManager = {
    flush: vi.fn<EntityManager['flush']>(),
    getReference: vi.fn<EntityManager['getReference']>(),
    remove: vi.fn<() => Pick<EntityManager, 'flush'>>(() => ({ flush: vi.fn<EntityManager['flush']>() })),
  };
  let repository: MikroOrmHeadOfficeRepository;
  let ormRepository: EntityRepository<HeadOfficeEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MikroOrmHeadOfficeRepository,
        {
          provide: getRepositoryToken(HeadOfficeEntity),
          useClass: EntityRepository<HeadOfficeEntity>,
        },
        {
          provide: EntityManager,
          useValue: entityManager,
        },
      ],
    }).compile();

    repository = module.get<MikroOrmHeadOfficeRepository>(MikroOrmHeadOfficeRepository);
    ormRepository = module.get<EntityRepository<HeadOfficeEntity>>(getRepositoryToken(HeadOfficeEntity));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.id = id.value;
      headOfficeEntity.cash = Money.Dollar;
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      await repository.findOne(id);

      expect(findOne).toHaveBeenCalledWith({ id: headOfficeEntity.id });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return HeadOffice if ormRepository.findOne returns HeadOfficeEntity', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.id = id.value;
      headOfficeEntity.cash = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findOne(id);

      expect(result).toBeInstanceOf(HeadOffice);
      expect(result?.id).toEqual(id);
      expect(result?.cash.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      headOfficeEntity.id = id.value;
      headOfficeEntity.cash = Money.Dollar;
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(findOne).toHaveBeenCalledWith({ id: id.value });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const create = vi.spyOn(ormRepository, 'create').mockImplementation(() => new HeadOfficeEntity());
      const headOffice = new HeadOffice(id);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(create).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      headOfficeEntity.id = id.value;
      headOfficeEntity.cash = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(entityManager.flush).toHaveBeenCalled();
    });
  });

  describe('#delete', () => {
    it('should call entityManager.getReference with proper id', async () => {
      const getReference = entityManager.getReference.mockImplementation(() => new HeadOfficeEntity());

      await repository.delete(id);

      expect(getReference).toHaveBeenCalledWith(HeadOfficeEntity, id.value);
    });

    it('should remove the reference returned by entityManager.getReference and flush', async () => {
      const headOfficeRef = new HeadOfficeEntity();
      entityManager.getReference.mockImplementation(() => headOfficeRef);
      const remove = entityManager.remove.mockImplementation(() => entityManager);

      await repository.delete(id);

      expect(remove).toHaveBeenCalledWith(headOfficeRef);
      expect(entityManager.flush).toHaveBeenCalled();
    });
  });
});
