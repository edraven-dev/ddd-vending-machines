import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import { HeadOffice } from '../../management/head-office';
import { HeadOfficeRepository } from '../../management/head-office.repository.interface';
import HeadOfficeEntity from './head-office.entity';
import { HeadOfficeMapper } from './head-office.mapper';

@Injectable()
export class MikroOrmHeadOfficeRepository implements HeadOfficeRepository {
  constructor(
    @InjectRepository(HeadOfficeEntity)
    private readonly headOfficeRepository: EntityRepository<HeadOfficeEntity>,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<HeadOffice[]> {
    const headOfficeEntities = await this.headOfficeRepository.findAll();

    return headOfficeEntities.map((headOfficeEntity) => HeadOfficeMapper.toDomain(headOfficeEntity));
  }

  async findOne(id: string): Promise<HeadOffice | null> {
    const headOfficeEntity = await this.headOfficeRepository.findOne({ id });

    if (!headOfficeEntity) {
      return null;
    }

    return HeadOfficeMapper.toDomain(headOfficeEntity);
  }

  async save(headOffice: HeadOffice): Promise<void> {
    const existingEntity = await this.headOfficeRepository.findOne({ id: headOffice.id });

    if (existingEntity) {
      existingEntity.assign(HeadOfficeMapper.toPersistence(headOffice));
    } else {
      this.headOfficeRepository.create(HeadOfficeMapper.toPersistence(headOffice));
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const headOfficeRef = this.em.getReference(HeadOfficeEntity, id);
    await this.em.remove(headOfficeRef).flush();
  }
}

export const HeadOfficeRepositoryProvider: Provider = {
  provide: HeadOfficeRepository,
  useClass: MikroOrmHeadOfficeRepository,
};
