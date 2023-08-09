import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { SnackMachineEntity } from '../../../app/database/snack-machine/snack-machine.entity';
import { MikroOrmSnackMachineRepository } from '../../../app/database/snack-machine/snack-machine.repository';
import { Money } from '../../../app/snack-machine/money';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';

describe('MikroOrmSnackMachineRepository', () => {
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
      ],
    }).compile();

    repository = module.get<MikroOrmSnackMachineRepository>(MikroOrmSnackMachineRepository);
    ormRepository = module.get(getRepositoryToken(SnackMachineEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findOne', () => {
    it('should call ormRepository.findOne with proper data', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = {
        fiveDollarCount: 1,
        oneCentCount: 1,
        oneDollarCount: 1,
        quarterCount: 1,
        tenCentCount: 1,
        twentyDollarCount: 1,
      };
      jest.spyOn(ormRepository, 'findOne').mockImplementation(() => Promise.resolve(snackMachineEntity));

      await repository.findOne();

      expect(ormRepository.findOne).toBeCalledWith({ id: { $exists: true } });
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(() => Promise.resolve(null));

      const result = await repository.findOne();

      expect(result).toBeNull();
    });

    it('should return SnackMachine if ormRepository.findOne returns SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = {
        fiveDollarCount: 1,
        oneCentCount: 1,
        oneDollarCount: 1,
        quarterCount: 1,
        tenCentCount: 1,
        twentyDollarCount: 1,
      };
      jest.spyOn(ormRepository, 'findOne').mockImplementation(() => Promise.resolve(snackMachineEntity));

      const result = await repository.findOne();

      expect(result).toBeInstanceOf(SnackMachine);
      expect(result.id).toBe('id');
      expect(result.moneyInside.fiveDollarCount).toBe(1);
      expect(result.moneyInside.oneCentCount).toBe(1);
      expect(result.moneyInside.oneDollarCount).toBe(1);
      expect(result.moneyInside.quarterCount).toBe(1);
      expect(result.moneyInside.tenCentCount).toBe(1);
      expect(result.moneyInside.twentyDollarCount).toBe(1);
    });
  });

  describe('save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      jest.spyOn(ormRepository, 'findOne');
      const em = {
        findOne: async () => new SnackMachineEntity(),
        persistAndFlush: jest.fn(),
      } as unknown as EntityManager;
      jest.spyOn(ormRepository, 'getEntityManager').mockImplementation(() => em);
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, {
        id: 'id',
        moneyInside: Money.Dollar,
      });

      await repository.save(snackMachine);

      expect(ormRepository.findOne).toBeCalledWith({ id: 'id' });
    });

    it('should call ormRepository.getEntityManager.persistAndFlush with proper data', async () => {
      const em = {
        findOne: async () => new SnackMachineEntity(),
        persistAndFlush: jest.fn(),
      } as unknown as EntityManager;
      jest.spyOn(ormRepository, 'getEntityManager').mockImplementation(() => em);
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, {
        id: 'id',
        moneyInside: Money.Dollar,
      });

      await repository.save(snackMachine);

      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = {
        fiveDollarCount: 0,
        oneCentCount: 0,
        oneDollarCount: 1,
        quarterCount: 0,
        tenCentCount: 0,
        twentyDollarCount: 0,
      };
      expect(em.persistAndFlush).toBeCalledWith(snackMachineEntity);
    });
  });
});
