import { Entity, type Id } from '@vending-machines/shared';
import type { SnackMachine } from './snack-machine';
import { SnackPile } from './snack-pile';

export class Slot extends Entity {
  readonly snackMachine: SnackMachine;
  readonly position: number;
  snackPile: SnackPile;

  constructor(id: Id, snackMachine: SnackMachine, position: number, snackPile: SnackPile = SnackPile.Empty) {
    super(id);
    this.snackMachine = snackMachine;
    this.position = position;
    this.snackPile = snackPile;
  }
}
