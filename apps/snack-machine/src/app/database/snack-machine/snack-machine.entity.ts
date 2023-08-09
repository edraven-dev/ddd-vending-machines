import { Embeddable, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Embeddable()
export class MoneyEmbeddable {
  @Property({ type: 'int' })
  oneCentCount!: number;

  @Property({ type: 'int' })
  tenCentCount!: number;

  @Property({ type: 'int' })
  quarterCount!: number;

  @Property({ type: 'int' })
  oneDollarCount!: number;

  @Property({ type: 'int' })
  fiveDollarCount!: number;

  @Property({ type: 'int' })
  twentyDollarCount!: number;
}

@Entity({ tableName: 'snack_machine' })
export class SnackMachineEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Embedded(() => MoneyEmbeddable)
  money!: MoneyEmbeddable;
}
