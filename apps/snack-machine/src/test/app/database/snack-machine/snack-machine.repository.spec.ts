import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import SnackMachineEntity from '../../../../app/database/snack-machine/snack-machine.entity';
import { MikroOrmSnackMachineRepository } from '../../../../app/database/snack-machine/snack-machine.repository';
import { SnackMachine } from '../../../../app/snack-machine/snack-machine';

describe('MikroOrmSnackMachineRepository', () => {
  const entityManagerMock = { flush: vi.fn<EntityManager['flush']>() };
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
    it('should call ormRepository.findOne with any id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      const spy = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);

      await repository.findOne(snackMachineEntity.id);

      expect(spy).toHaveBeenCalledWith(
        { id: snackMachineEntity.id },
        { populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'] },
      );
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const id = randomUUID();

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return SnackMachine if ormRepository.findOne returns SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);

      const result = await repository.findOne(snackMachineEntity.id);

      assert(result instanceof SnackMachine, 'result should be an instance of SnackMachine');
      expect(result.id).toBe('id');
      expect(result.moneyInside.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      vi.spyOn(snackMachineEntity, 'assign').mockReturnThis();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      const spy = vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = new SnackMachine('id');
      snackMachine.moneyInside = Money.Dollar;

      await repository.save(snackMachine);

      expect(spy).toHaveBeenCalledWith({ id: 'id' }, { populate: ['slots'] });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const spy = vi.spyOn(ormRepository, 'create').mockImplementation(() => new SnackMachineEntity());
      const snackMachine = new SnackMachine('id');
      snackMachine.moneyInside = Money.Dollar;

      await repository.save(snackMachine);

      expect(spy).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      vi.spyOn(snackMachineEntity, 'assign').mockReturnThis();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      vi.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = new SnackMachine('id');
      snackMachine.moneyInside = Money.Dollar;

      await repository.save(snackMachine);

      expect(entityManagerMock.flush).toHaveBeenCalled();
    });
  });
});
