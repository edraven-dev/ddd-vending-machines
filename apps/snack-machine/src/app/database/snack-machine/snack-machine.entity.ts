import { BaseEntity, Cascade, Collection } from '@mikro-orm/core';
import { Embedded, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { MoneyEmbeddable } from '@vending-machines/shared';
import SlotEntity from './slot.entity';

@Entity({ tableName: 'snack_machine' })
export default class SnackMachineEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Embedded(() => MoneyEmbeddable)
  money!: MoneyEmbeddable;

  @Property({ type: 'varchar', length: 255 })
  moneyInTransaction!: string;

  @OneToMany(() => SlotEntity, (slot) => slot.snackMachine, { cascade: [Cascade.ALL], orphanRemoval: true })
  slots = new Collection<SlotEntity>(this);
}
