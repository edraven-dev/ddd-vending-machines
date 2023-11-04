import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
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

  async findOne(): Promise<Atm | null> {
    const atmEntity = await this.atmRepository.findOne({ id: { $exists: true } });

    if (!atmEntity) {
      return null;
    }

    return AtmMapper.toDomain(atmEntity);
  }

  async save(atm: Atm): Promise<void> {
    const atmEntity = await this.atmRepository.findOne({ id: atm.id });

    atmEntity.assign(AtmMapper.toPersistence(atm));

    await this.em.flush();
  }
}

export const AtmRepositoryProvider: Provider = {
  provide: AtmRepository,
  useClass: MikroOrmAtmRepository,
};
