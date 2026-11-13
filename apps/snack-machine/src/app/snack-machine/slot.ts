import { Entity, type Id } from '@vending-machines/shared';
import { SnackPile } from './snack-pile';

export class Slot extends Entity {
  readonly position: number;
  snackPile: SnackPile;

  constructor(id: Id, position: number, snackPile: SnackPile = SnackPile.Empty) {
    super(id);
    this.position = position;
    this.snackPile = snackPile;
  }
}
