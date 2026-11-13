import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import type { Id } from '@vending-machines/shared';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackMachineRepository } from '../../snack-machine/snack-machine.repository.interface';
import SnackMachineEntity from './snack-machine.entity';
import { SnackMachineMapper } from './snack-machine.mapper';

@Injectable()
export class MikroOrmSnackMachineRepository implements SnackMachineRepository {
  constructor(
    @InjectRepository(SnackMachineEntity)
    private readonly snackMachineRepository: EntityRepository<SnackMachineEntity>,
    private readonly em: EntityManager,
  ) {}

  async findOne(id: Id): Promise<SnackMachine | null> {
    const snackMachineEntity = await this.snackMachineRepository.findOne(
      { id: id.value },
      { populate: ['slots', 'slots.snackPile', 'slots.snackPile.snack'] },
    );

    if (!snackMachineEntity) {
      return null;
    }

    return SnackMachineMapper.toDomain(snackMachineEntity);
  }

  async save(snackMachine: SnackMachine): Promise<void> {
    const existingEntity = await this.snackMachineRepository.findOne(
      { id: snackMachine.id.value },
      { populate: ['slots'] },
    );

    if (existingEntity) {
      existingEntity.assign(SnackMachineMapper.toPersistence(snackMachine));
    } else {
      this.snackMachineRepository.create(SnackMachineMapper.toPersistence(snackMachine));
    }

    await this.em.flush();
  }

  async delete(id: Id): Promise<void> {
    const snackMachineRef = this.em.getReference(SnackMachineEntity, id.value);
    await this.em.remove(snackMachineRef).flush();
  }
}

export const SnackMachineRepositoryProvider: Provider = {
  provide: SnackMachineRepository,
  useClass: MikroOrmSnackMachineRepository,
};
