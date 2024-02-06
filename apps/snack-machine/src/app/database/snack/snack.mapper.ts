import { EntityDTO } from '@mikro-orm/core';
import { Snack } from '../../snack/snack';
import SnackEntity from './snack.entity';

export class SnackMapper {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static toDomain(entity: EntityDTO<SnackEntity>): Snack {
    switch (entity.id) {
      case Snack.Chocolate.id:
        return Snack.Chocolate;
      case Snack.Soda.id:
        return Snack.Soda;
      case Snack.Gum.id:
        return Snack.Gum;
      default:
        return Snack.None;
    }
  }
}
