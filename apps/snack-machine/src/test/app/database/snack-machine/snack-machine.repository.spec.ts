import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import SnackMachineEntity from '../../../../app/database/snack-machine/snack-machine.entity';
import { MikroOrmSnackMachineRepository } from '../../../../app/database/snack-machine/snack-machine.repository';
import { SnackMachine } from '../../../../app/snack-machine/snack-machine';

describe('MikroOrmSnackMachineRepository', () => {
  let entityManager: EntityManager;
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
        {
          provide: EntityManager,
          useValue: { flush: jest.fn() },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmSnackMachineRepository>(MikroOrmSnackMachineRepository);
    ormRepository = module.get<EntityRepository<SnackMachineEntity>>(getRepositoryToken(SnackMachineEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);

      await repository.findOne(snackMachineEntity.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith(
        { id: snackMachineEntity.id },
        { populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'] },
      );
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      const id = randomUUID();

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });

    it('should return SnackMachine if ormRepository.findOne returns SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);

      const result = await repository.findOne(snackMachineEntity.id);

      expect(result).toBeDefined();
      expect(result!).toBeInstanceOf(SnackMachine);
      expect(result!.id).toBe('id');
      expect(result!.moneyInside.oneDollarCount).toBe(1);
    });
  });

  describe('#save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.assign = jest.fn();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, { id: 'id', moneyInside: Money.Dollar });

      await repository.save(snackMachine);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ id: 'id' }, { populate: ['slots'] });
    });

    it('should call ormRepository.create if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => null);
      jest.spyOn(ormRepository, 'create').mockImplementation(() => new SnackMachineEntity());
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, { id: 'id', moneyInside: Money.Dollar });

      await repository.save(snackMachine);

      expect(ormRepository.create).toHaveBeenCalled();
    });

    it('should call entityManager.flush', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.assign = jest.fn();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = Money.Dollar;
      jest.spyOn(ormRepository, 'findOne').mockImplementation(async () => snackMachineEntity);
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, {
        id: 'id',
        moneyInside: Money.Dollar,
      });

      await repository.save(snackMachine);

      expect(entityManager.flush).toHaveBeenCalled();
    });
  });
});
