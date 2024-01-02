import { Cascade, Embeddable, Embedded, Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import SnackEntity from '../snack/snack.entity';
import SnackMachineEntity from './snack-machine.entity';

@Embeddable()
export class SnackPileEmbeddable {
  @Property({ type: 'int' })
  quantity!: number;

  @Property({ type: 'varchar', length: 255 })
  price!: string;

  @OneToOne({ cascade: [Cascade.ALL], unique: false })
  snack!: SnackEntity;
}

@Entity({ tableName: 'slot' })
export default class SlotEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  position!: number;

  @ManyToOne(() => SnackMachineEntity)
  snackMachine!: SnackMachineEntity;

  @Embedded(() => SnackPileEmbeddable)
  snackPile!: SnackPileEmbeddable;
}
