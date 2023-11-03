import { BaseEntity, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { MoneyEmbeddable } from '@vending-machines/shared';

@Entity({ tableName: 'atm' })
export default class AtmEntity extends BaseEntity<AtmEntity, 'id'> {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'decimal', precision: 18, scale: 2 })
  moneyCharged!: number;

  @Embedded(() => MoneyEmbeddable)
  money!: MoneyEmbeddable;
}
