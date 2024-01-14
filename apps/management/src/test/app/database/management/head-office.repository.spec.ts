import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import HeadOfficeEntity from '../../../../app/database/management/head-office.entity';
import { MikroOrmHeadOfficeRepository } from '../../../../app/database/management/head-office.repository';
import { HeadOffice } from '../../../../app/management/head-office';

describe('MikroOrmHeadOfficeRepository', () => {
  let entityManager: EntityManager;
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
          useValue: { flush: jest.fn() },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmHeadOfficeRepository>(MikroOrmHeadOfficeRepository);
    ormRepository = module.get<EntityRepository<HeadOfficeEntity>>(getRepositoryToken(HeadOfficeEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.id = 'id';
      headOfficeEntity.cash = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      await repository.findOne(headOfficeEntity.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ id: headOfficeEntity.id });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const id = randomUUID();

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return HeadOffice if ormRepository.findOne returns HeadOfficeEntity', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.id = 'id';
      headOfficeEntity.cash = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findOne(headOfficeEntity.id);

      expect(result).toBeInstanceOf(HeadOffice);
      expect(result.id).toBe('id');
      expect(result.cash.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.assign = jest.fn();
      headOfficeEntity.id = 'id';
      headOfficeEntity.cash = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice();
      Object.assign(headOffice, { id: 'id', cash: Money.Dollar });

      await repository.save(headOffice);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      jest.spyOn(ormRepository, 'create').mockImplementation(() => new HeadOfficeEntity());
      const headOffice = new HeadOffice();
      Object.assign(headOffice, { id: 'id', moneyInside: Money.Dollar });

      await repository.save(headOffice);

      expect(ormRepository.create).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const headOfficeEntity = new HeadOfficeEntity();
      headOfficeEntity.assign = jest.fn();
      headOfficeEntity.id = 'id';
      headOfficeEntity.cash = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice();
      Object.assign(headOffice, { id: 'id', cash: Money.Dollar });

      await repository.save(headOffice);

      expect(entityManager.flush).toHaveBeenCalled();
    });
  });
});
