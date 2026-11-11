import { BaseEntity } from '@mikro-orm/core';
import { Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { MoneyEmbeddable } from '@vending-machines/shared';

@Entity({ tableName: 'atm' })
export default class AtmEntity extends BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 255 })
  moneyCharged!: string;

  @Embedded(() => MoneyEmbeddable)
  money!: MoneyEmbeddable;
}
