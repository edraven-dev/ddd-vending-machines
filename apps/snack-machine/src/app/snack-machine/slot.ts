import { Entity } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { SnackMachine } from './snack-machine';
import { SnackPile } from './snack-pile';

export class Slot extends Entity {
  readonly snackMachine: SnackMachine;
  readonly position: number;
  snackPile: SnackPile;

  constructor(snackMachine: SnackMachine, position: number) {
    super(randomUUID());
    this.snackMachine = snackMachine;
    this.position = position;
    this.snackPile = SnackPile.Empty;
  }
}
