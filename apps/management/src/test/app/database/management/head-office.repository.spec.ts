import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import HeadOfficeAtmEntity from '../../../../app/database/management/head-office-atm.entity';
import HeadOfficeSnackMachineEntity from '../../../../app/database/management/head-office-snack-machine.entity';
import HeadOfficeEntity from '../../../../app/database/management/head-office.entity';
import { HeadOfficeMapper } from '../../../../app/database/management/head-office.mapper';
import { MikroOrmHeadOfficeRepository } from '../../../../app/database/management/head-office.repository';
import { HeadOffice } from '../../../../app/management/head-office';

const orm = new MikroORM({
  dbName: 'unused',
  metadataProvider: ReflectMetadataProvider,
  entities: [HeadOfficeEntity, HeadOfficeAtmEntity, HeadOfficeSnackMachineEntity],
});

const createHeadOfficeEntity = (id: Id, atmIds: Id[], snackMachineIds: Id[], expiresAt: Date): HeadOfficeEntity =>
  orm.em.fork().create(HeadOfficeEntity, {
    id: id.value,
    atms: atmIds.map((atmId) => ({ atmId: atmId.value })),
    snackMachines: snackMachineIds.map((snackMachineId) => ({ snackMachineId: snackMachineId.value })),
    balance: 0,
    cash: {
      oneCentCount: 0,
      tenCentCount: 0,
      quarterCount: 0,
      oneDollarCount: 1,
      fiveDollarCount: 0,
      twentyDollarCount: 0,
    },
    expiresAt,
  });

describe('MikroOrmHeadOfficeRepository', () => {
  const id = Id.generate();
  const atmId = Id.generate();
  const atmIds = [Id.generate(), atmId];
  const snackMachineIds = [Id.generate(), Id.generate()];
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
    it('should call ormRepository.findOne with proper id and populated machines', async () => {
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      await repository.findOne(id);

      expect(findOne).toHaveBeenCalledWith({ id: id.value }, { populate: ['atms', 'snackMachines'] });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return HeadOffice if ormRepository.findOne returns HeadOfficeEntity', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmIds, snackMachineIds, expiresAt);
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findOne(id);

      assert(result instanceof HeadOffice, 'result should be an instance of HeadOffice');
      expect(result.id).toEqual(id);
      expect(result.cash.oneDollarCount).toBe(1);
    });
  });

  describe('#findByAtmId', () => {
    it('should call ormRepository.findOne with the atm id among the atms and populated machines', async () => {
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      await repository.findByAtmId(atmId);

      expect(findOne).toHaveBeenCalledWith({ atms: { atmId: atmId.value } }, { populate: ['atms', 'snackMachines'] });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      const result = await repository.findByAtmId(atmId);

      expect(result).toBeNull();
    });

    it('should return HeadOffice with all its machines if ormRepository.findOne returns HeadOfficeEntity', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmIds, snackMachineIds, expiresAt);
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);

      const result = await repository.findByAtmId(atmId);

      assert(result instanceof HeadOffice, 'result should be an instance of HeadOffice');
      expect(result.id).toEqual(id);
      expect(result.atmIds).toEqual(atmIds);
      expect(result.snackMachineIds).toEqual(snackMachineIds);
      expect(result.expiresAt).toEqual(expiresAt);
    });
  });

  describe('#findExpired', () => {
    it('should call ormRepository.find with head offices expiring at or before now and populated machines', async () => {
      const now = new Date();
      const find = vi.spyOn(ormRepository, 'find').mockImplementation(async () => []);

      await repository.findExpired(now);

      expect(find).toHaveBeenCalledWith({ expiresAt: { $lte: now } }, { populate: ['atms', 'snackMachines'] });
    });

    it('should return a HeadOffice for every HeadOfficeEntity returned by ormRepository.find', async () => {
      const headOfficeEntities = [
        createHeadOfficeEntity(Id.generate(), [Id.generate()], [Id.generate()], expiresAt),
        createHeadOfficeEntity(Id.generate(), [Id.generate()], [Id.generate()], expiresAt),
      ];
      vi.spyOn(ormRepository, 'find').mockImplementation(async () => headOfficeEntities);

      const result = await repository.findExpired(new Date());

      expect(result.map((headOffice) => headOffice.id.value)).toEqual(headOfficeEntities.map((entity) => entity.id));
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id and populated machines', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmIds, snackMachineIds, expiresAt);
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      const findOne = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id, atmIds, snackMachineIds, expiresAt);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(findOne).toHaveBeenCalledWith({ id: id.value }, { populate: ['atms', 'snackMachines'] });
    });

    it('should assign the mapped data to the existing HeadOfficeEntity', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmIds, snackMachineIds, expiresAt);
      const assign = vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id, atmIds, snackMachineIds, expiresAt);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(assign).toHaveBeenCalledWith(HeadOfficeMapper.toPersistence(headOffice));
    });

    it('should call ormRepository.create with the mapped data if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const create = vi.spyOn(ormRepository, 'create').mockImplementation(() => new HeadOfficeEntity());
      const headOffice = new HeadOffice(id, atmIds, snackMachineIds, expiresAt);
      headOffice.cash = Money.Dollar;

      await repository.save(headOffice);

      expect(create).toHaveBeenCalledWith(HeadOfficeMapper.toPersistence(headOffice));
    });

    it('should call entityManager.flush', async () => {
      const headOfficeEntity = createHeadOfficeEntity(id, atmIds, snackMachineIds, expiresAt);
      vi.spyOn(headOfficeEntity, 'assign').mockReturnThis();
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => headOfficeEntity);
      const headOffice = new HeadOffice(id, atmIds, snackMachineIds, expiresAt);
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
