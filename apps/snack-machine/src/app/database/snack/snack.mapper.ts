import { Snack } from '../../snack/snack';
import type SnackEntity from './snack.entity';

export class SnackMapper {
  // oxlint-disable-next-line no-empty-function
  private constructor() {}

  static toDomain(entity: Pick<SnackEntity, 'id'>): Snack {
    switch (entity.id) {
      case Snack.Chocolate.id.value:
        return Snack.Chocolate;
      case Snack.Soda.id.value:
        return Snack.Soda;
      case Snack.Gum.id.value:
        return Snack.Gum;
      default:
        throw new Error(`Unknown snack ${entity.id}`);
    }
  }
}
