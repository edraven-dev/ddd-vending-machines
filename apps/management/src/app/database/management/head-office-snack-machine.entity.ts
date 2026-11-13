import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey } from '@mikro-orm/decorators/legacy';
import HeadOfficeEntity from './head-office.entity';

@Entity({ tableName: 'head_office_snack_machine' })
export default class HeadOfficeSnackMachineEntity {
  @PrimaryKey({ type: 'uuid' })
  snackMachineId!: string;

  @Index()
  @ManyToOne(() => HeadOfficeEntity, { deleteRule: 'cascade' })
  headOffice!: Rel<HeadOfficeEntity>;
}
