import { BaseEntity, Cascade, Collection } from '@mikro-orm/core';
import { Embedded, Entity, Index, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { MoneyEmbeddable } from '@vending-machines/shared';
import HeadOfficeAtmEntity from './head-office-atm.entity';
import HeadOfficeSnackMachineEntity from './head-office-snack-machine.entity';

@Entity({ tableName: 'head_office' })
export default class HeadOfficeEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @OneToMany(() => HeadOfficeAtmEntity, (atm) => atm.headOffice, { cascade: [Cascade.ALL], orphanRemoval: true })
  atms = new Collection<HeadOfficeAtmEntity>(this);

  @OneToMany(() => HeadOfficeSnackMachineEntity, (snackMachine) => snackMachine.headOffice, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  snackMachines = new Collection<HeadOfficeSnackMachineEntity>(this);

  @Property({ type: 'decimal', precision: 18, scale: 2 })
  balance!: number;

  @Embedded(() => MoneyEmbeddable)
  cash!: MoneyEmbeddable;

  @Index()
  @Property({ type: 'datetime' })
  expiresAt!: Date;
}
