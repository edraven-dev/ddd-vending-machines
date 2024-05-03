import { BaseEntity, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { MoneyEmbeddable } from '@vending-machines/shared';

@Entity({ tableName: 'head_office' })
export default class HeadOfficeEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'decimal', precision: 18, scale: 2 })
  balance!: number;

  @Embedded(() => MoneyEmbeddable)
  cash!: MoneyEmbeddable;
}
