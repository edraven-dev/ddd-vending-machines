import { EntityManager, EntityRepository, Loaded } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { SnackMachineEntity } from '../../../../app/database/snack-machine/snack-machine.entity';
import { MikroOrmSnackMachineRepository } from '../../../../app/database/snack-machine/snack-machine.repository';
import { Money } from '../../../../app/snack-machine/money';
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
          useValue: {
            flush: jest.fn(),
          },
        },
      ],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<MikroOrmSnackMachineRepository>(MikroOrmSnackMachineRepository);
    ormRepository = module.get(getRepositoryToken(SnackMachineEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findOne', () => {
    it('should call ormRepository.findOne with any id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = { ...Money.Dollar };
      jest
        .spyOn(ormRepository, 'findOne')
        .mockImplementation(
          () => Promise.resolve(snackMachineEntity) as unknown as Promise<Loaded<SnackMachineEntity, string>>,
        );

      await repository.findOne();

      expect(ormRepository.findOne).toBeCalledWith(
        { id: { $exists: true } },
        { populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'], strategy: 'select-in' }, // FIXME: https://github.com/mikro-orm/mikro-orm/issues/4546
      );
    });

    it('should return null if ormRepository.findOne returns null', async () => {
      jest.spyOn(ormRepository, 'findOne').mockImplementation(() => Promise.resolve(null));

      const result = await repository.findOne();

      expect(result).toBeNull();
    });

    it('should return SnackMachine if ormRepository.findOne returns SnackMachineEntity', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = { ...Money.Dollar };
      jest
        .spyOn(ormRepository, 'findOne')
        .mockImplementation(
          () => Promise.resolve(snackMachineEntity) as unknown as Promise<Loaded<SnackMachineEntity, string>>,
        );

      const result = await repository.findOne();

      expect(result).toBeInstanceOf(SnackMachine);
      expect(result.id).toBe('id');
      expect(result.moneyInside.oneDollarCount).toBe(1);
    });
  });

  describe('save', () => {
    it('should call ormRepository.findOne with proper id', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.assign = jest.fn();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = { ...Money.Dollar };
      jest
        .spyOn(ormRepository, 'findOne')
        .mockImplementation(
          () => Promise.resolve(snackMachineEntity) as unknown as Promise<Loaded<SnackMachineEntity, string>>,
        );
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, {
        id: 'id',
        moneyInside: Money.Dollar,
      });

      await repository.save(snackMachine);

      expect(ormRepository.findOne).toBeCalledWith({ id: 'id' }, { populate: ['slots'], strategy: 'select-in' });
    });

    it('should call entityManager.flush', async () => {
      const snackMachineEntity = new SnackMachineEntity();
      snackMachineEntity.assign = jest.fn();
      snackMachineEntity.id = 'id';
      snackMachineEntity.money = { ...Money.Dollar };
      jest
        .spyOn(ormRepository, 'findOne')
        .mockImplementation(
          () => Promise.resolve(snackMachineEntity) as unknown as Promise<Loaded<SnackMachineEntity, string>>,
        );
      const snackMachine = new SnackMachine();
      Object.assign(snackMachine, {
        id: 'id',
        moneyInside: Money.Dollar,
      });

      await repository.save(snackMachine);

      expect(entityManager.flush).toBeCalled();
    });
  });
});
