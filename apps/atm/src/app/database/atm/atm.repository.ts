import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import type { Id } from '@vending-machines/shared';
import { Atm } from '../../atm/atm';
import { AtmRepository } from '../../atm/atm.repository.interface';
import AtmEntity from './atm.entity';
import { AtmMapper } from './atm.mapper';

@Injectable()
export class MikroOrmAtmRepository implements AtmRepository {
  constructor(
    @InjectRepository(AtmEntity)
    private readonly atmRepository: EntityRepository<AtmEntity>,
    private readonly em: EntityManager,
  ) {}

  async exists(id: Id): Promise<boolean> {
    return (await this.atmRepository.count({ id: id.value })) > 0;
  }

  async findOne(id: Id): Promise<Atm | null> {
    const atmEntity = await this.atmRepository.findOne({ id: id.value });

    if (!atmEntity) {
      return null;
    }

    return AtmMapper.toDomain(atmEntity);
  }

  async save(atm: Atm): Promise<void> {
    const existingEntity = await this.atmRepository.findOne({ id: atm.id.value });

    if (existingEntity) {
      existingEntity.assign(AtmMapper.toPersistence(atm));
    } else {
      this.atmRepository.create(AtmMapper.toPersistence(atm));
    }

    await this.em.flush();
  }

  async delete(id: Id): Promise<void> {
    const atmRef = this.em.getReference(AtmEntity, id.value);
    await this.em.remove(atmRef).flush();
  }
}

export const AtmRepositoryProvider: Provider = {
  provide: AtmRepository,
  useClass: MikroOrmAtmRepository,
};
