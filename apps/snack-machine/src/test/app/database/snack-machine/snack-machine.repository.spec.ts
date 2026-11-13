import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import SnackMachineEntity from '../../../../app/database/snack-machine/snack-machine.entity';
import { SnackMachineMapper } from '../../../../app/database/snack-machine/snack-machine.mapper';
import { MikroOrmSnackMachineRepository } from '../../../../app/database/snack-machine/snack-machine.repository';
import { SnackMachine } from '../../../../app/snack-machine/snack-machine';

describe('MikroOrmSnackMachineRepository', () => {
  const id = Id.generate();
  const entityManagerMock = {
    flush: vi.fn<EntityManager['flush']>(),
    getReference: vi.fn<EntityManager['getReference']>(),
    remove: vi.fn<() => Pick<EntityManager, 'flush'>>(() => ({ flush: vi.fn<EntityManager['flush']>() })),
  };
  let repository: MikroOrmSnackMachineRepository;
  let ormRepository: EntityRepository<SnackMachineEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MikroOrmSnackMachineRepository,
        {
          provide: getRepositoryToken(SnackMachineEntity),
          useClass: EntityRepository<SnackMachineEntity>,
        },
        { provide: EntityManager, useValue: entityManagerMock },
      ],
    }).compile();

    repository = module.get<MikroOrmSnackMachineRepository>(MikroOrmSnackMachineRepository);
    ormRepository = module.get<EntityRepository<SnackMachineEntity>>(getRepositoryToken(SnackMachineEntity));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with proper id and populated slots', async () => {
      const spy = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      await repository.findOne(id);

      expect(spy).toHaveBeenCalledWith(
        { id: id.value },
        { populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'] },
      );
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return SnackMachine mapped from the found SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      const snackMachine = SnackMachine.create(id);
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const toDomain = vi.spyOn(SnackMachineMapper, 'toDomain').mockReturnValue(snackMachine);

      const result = await repository.findOne(id);

      expect(toDomain).toHaveBeenCalledWith(snackMachineEntity);
      expect(result).toBe(snackMachine);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      vi.spyOn(snackMachineEntity, 'assign').mockReturnThis();
      const spy = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = SnackMachine.create(id);
      snackMachine.moneyInside = Money.Dollar;

      await repository.save(snackMachine);

      expect(spy).toHaveBeenCalledWith({ id: id.value }, { populate: ['slots'] });
    });

    it('should assign the mapped data to the existing SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      const assign = vi.spyOn(snackMachineEntity, 'assign').mockReturnThis();
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = SnackMachine.create(id);

      await repository.save(snackMachine);

      expect(assign).toHaveBeenCalledWith(SnackMachineMapper.toPersistence(snackMachine));
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const spy = vi.spyOn(ormRepository, 'create').mockImplementation(() => new SnackMachineEntity());
      const snackMachine = SnackMachine.create(id);
      snackMachine.moneyInside = Money.Dollar;

      await repository.save(snackMachine);

      expect(spy).toHaveBeenCalledWith(SnackMachineMapper.toPersistence(snackMachine));
    });

    it('should call entityManager.flush', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      vi.spyOn(snackMachineEntity, 'assign').mockReturnThis();
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = SnackMachine.create(id);

      await repository.save(snackMachine);

      expect(entityManagerMock.flush).toHaveBeenCalled();
    });
  });

  describe('#delete', () => {
    it('should call entityManager.getReference with proper id', async () => {
      const getReference = entityManagerMock.getReference.mockImplementation(() => new SnackMachineEntity());

      await repository.delete(id);

      expect(getReference).toHaveBeenCalledWith(SnackMachineEntity, id.value);
    });

    it('should remove the reference returned by entityManager.getReference and flush', async () => {
      const snackMachineRef = new SnackMachineEntity();
      entityManagerMock.getReference.mockImplementation(() => snackMachineRef);
      const remove = entityManagerMock.remove.mockImplementation(() => entityManagerMock);

      await repository.delete(id);

      expect(remove).toHaveBeenCalledWith(snackMachineRef);
      expect(entityManagerMock.flush).toHaveBeenCalled();
    });
  });
});
