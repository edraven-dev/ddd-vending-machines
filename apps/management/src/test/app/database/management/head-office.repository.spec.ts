import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import HeadOfficeEntity from '../../../../app/database/management/head-office.entity';
import { MikroOrmHeadOfficeRepository } from '../../../../app/database/management/head-office.repository';
import { HeadOffice } from '../../../../app/management/head-office';

const createHeadOfficeEntity = (id: Id, atmId: Id, snackMachineId: Id, expiresAt: Date): HeadOfficeEntity => {
  const headOfficeEntity = new HeadOfficeEntity();
  headOfficeEntity.id = id.value;
  headOfficeEntity.atmId = atmId.value;
  headOfficeEntity.snackMachineId = snackMachineId.value;
  headOfficeEntity.cash = Money.Dollar;
  headOfficeEntity.expiresAt = expiresAt;
  return headOfficeEntity;
};

describe('MikroOrmHeadOfficeRepository', () => {
  const id = Id.generate();
  const atmId = Id.generate();
  const snackMachineId = Id.generate();
  const expiresAt = new Date('2026-11-14T12:00:00.000Z');
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
      const headOfficeEntity = createHeadOfficeEntity(id, atmId, snackMachineId, expiresAt);
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
      const headOfficeEntity = createHeadOfficeEntity(id, atmId, snackMachineId, expiresAt);
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findOne(id);

      assert(result instanceof HeadOffice, 'result should be an instance of HeadOffice');
      expect(result.id).toEqual(id);
      expect(result.cash.oneDollarCount).toBe(1);
    });
  });

  describe('#findByAtmId', () => {
    it('should call ormRepository.findOne with the atm id', async () => {
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      await repository.findByAtmId(atmId);

      expect(findOne).toHaveBeenCalledWith({ atmId: atmId.value });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      const result = await repository.findByAtmId(atmId);

      expect(result).toBeNull();
    });

    it('should return HeadOffice with its references if ormRepository.findOne returns HeadOfficeEntity', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmId, snackMachineId, expiresAt);
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findByAtmId(atmId);

      assert(result instanceof HeadOffice, 'result should be an instance of HeadOffice');
      expect(result.id).toEqual(id);
      expect(result.atmId).toEqual(atmId);
      expect(result.snackMachineId).toEqual(snackMachineId);
      expect(result.expiresAt).toEqual(expiresAt);
    });
  });

  describe('#findExpired', () => {
    it('should call ormRepository.find with head offices expiring at or before now', async () => {
      const now = new Date();
      const find = vi.spyOn(ormRepository, 'find').mockImplementation(async () => []);

      await repository.findExpired(now);

      expect(find).toHaveBeenCalledWith({ expiresAt: { $lte: now } });
    });

    it('should return a HeadOffice for every HeadOfficeEntity returned by ormRepository.find', async () => {
      const headOfficeEntities = [
        createHeadOfficeEntity(Id.generate(), Id.generate(), Id.generate(), expiresAt),
        createHeadOfficeEntity(Id.generate(), Id.generate(), Id.generate(), expiresAt),
      ];
      vi.spyOn(ormRepository, 'find').mockImplementation(async () => headOfficeEntities);

      const result = await repository.findExpired(new Date());

      expect(result.map((headOffice) => headOffice.id.value)).toEqual(headOfficeEntities.map((entity) => entity.id));
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmId, snackMachineId, expiresAt);
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id, atmId, snackMachineId, expiresAt);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(findOne).toHaveBeenCalledWith({ id: id.value });
    });

    it('should call ormRepository.create with the head office data if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const create = vi.spyOn(ormRepository, 'create').mockImplementation(() => new HeadOfficeEntity());
      const headOffice = new HeadOffice(id, atmId, snackMachineId, expiresAt);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ id: id.value, atmId: atmId.value, snackMachineId: snackMachineId.value, expiresAt }),
      );
    });

    it('should call entityManager.flush', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmId, snackMachineId, expiresAt);
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id, atmId, snackMachineId, expiresAt);
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
