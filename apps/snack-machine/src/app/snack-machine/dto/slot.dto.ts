import { SnackPileDto } from './snack-pile.dto';

export class SlotDto {
  readonly id!: string;
  readonly position!: number;
  readonly snackPile!: SnackPileDto;

  constructor(id: string, position: number, snackPile: SnackPileDto) {
    this.id = id;
    this.position = position;
    this.snackPile = snackPile;
  }
}
