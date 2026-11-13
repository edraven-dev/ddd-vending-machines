import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey } from '@mikro-orm/decorators/legacy';
import HeadOfficeEntity from './head-office.entity';

@Entity({ tableName: 'head_office_atm' })
export default class HeadOfficeAtmEntity {
  @PrimaryKey({ type: 'uuid' })
  atmId!: string;

  @Index()
  @ManyToOne(() => HeadOfficeEntity, { deleteRule: 'cascade' })
  headOffice!: Rel<HeadOfficeEntity>;
}
