import { BaseEntity } from '@mikro-orm/core';
import { Embedded, Entity, Index, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { MoneyEmbeddable } from '@vending-machines/shared';

@Entity({ tableName: 'head_office' })
export default class HeadOfficeEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', unique: true })
  atmId!: string;

  @Property({ type: 'uuid', unique: true })
  snackMachineId!: string;

  @Property({ type: 'decimal', precision: 18, scale: 2 })
  balance!: number;

  @Embedded(() => MoneyEmbeddable)
  cash!: MoneyEmbeddable;

  @Index()
  @Property({ type: 'datetime' })
  expiresAt!: Date;
}
