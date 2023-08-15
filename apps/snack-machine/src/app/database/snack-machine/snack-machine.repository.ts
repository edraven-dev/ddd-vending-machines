import { EntityManager, EntityRepository, LoadStrategy } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackMachineRepository } from '../../snack-machine/snack-machine.repository.interface';
import { SnackMachineEntity } from './snack-machine.entity';
import { SnackMachineMapper } from './snack-machine.mapper';

@Injectable()
export class MikroOrmSnackMachineRepository implements SnackMachineRepository {
  constructor(
    @InjectRepository(SnackMachineEntity)
    private readonly snackMachineRepository: EntityRepository<SnackMachineEntity>,
    private readonly em: EntityManager,
  ) {}

  async findOne(): Promise<SnackMachine | null> {
    const snackMachineEntity = await this.snackMachineRepository.findOne(
      { id: { $exists: true } },
      {
        populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'],
        strategy: LoadStrategy.SELECT_IN, // FIXME: https://github.com/mikro-orm/mikro-orm/issues/4546
      },
    );

    if (!snackMachineEntity) {
      return null;
    }

    const snackMachine = SnackMachineMapper.toDomain(snackMachineEntity);
    return snackMachine;
  }

  async save(snackMachine: SnackMachine): Promise<void> {
    const snackMachineEntity = await this.snackMachineRepository.findOne(
      { id: snackMachine.id },
      {
        populate: ['slots'],
        strategy: LoadStrategy.SELECT_IN, // FIXME: https://github.com/mikro-orm/mikro-orm/issues/4546
      },
    );

    snackMachineEntity.assign(SnackMachineMapper.toPersistence(snackMachine));
    this.em.flush();
  }
}

export const SnackMachineRepositoryProvider: Provider = {
  provide: SnackMachineRepository,
  useClass: MikroOrmSnackMachineRepository,
};
