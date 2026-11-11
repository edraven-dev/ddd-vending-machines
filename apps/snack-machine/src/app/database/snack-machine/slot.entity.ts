import { Cascade, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import SnackEntity from '../snack/snack.entity';
import SnackMachineEntity from './snack-machine.entity';

@Embeddable()
export class SnackPileEmbeddable {
  @Property({ type: 'int' })
  quantity!: number;

  @Property({ type: 'varchar', length: 255 })
  price!: string;

  // MikroORM 7 no longer derives nullability and FK rules from `cascade`, so they are spelled out to match the schema.
  @OneToOne(() => SnackEntity, {
    cascade: [Cascade.ALL],
    unique: false,
    nullable: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  snack!: SnackEntity;
}

@Entity({ tableName: 'slot' })
export default class SlotEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  position!: number;

  // Rel<> keeps the circular SnackMachineEntity import out of the emitted decorator metadata.
  @ManyToOne(() => SnackMachineEntity, { updateRule: 'cascade' })
  snackMachine!: Rel<SnackMachineEntity>;

  @Embedded(() => SnackPileEmbeddable)
  snackPile!: SnackPileEmbeddable;
}
