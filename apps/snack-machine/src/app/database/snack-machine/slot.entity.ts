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

  @OneToOne(() => SnackEntity, {
    cascade: [Cascade.ALL],
    unique: false,
    nullable: true,
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  snack!: SnackEntity | null;
}

@Entity({ tableName: 'slot' })
export default class SlotEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  position!: number;

  @ManyToOne(() => SnackMachineEntity, { updateRule: 'cascade' })
  snackMachine!: Rel<SnackMachineEntity>;

  @Embedded(() => SnackPileEmbeddable)
  snackPile!: SnackPileEmbeddable;
}
