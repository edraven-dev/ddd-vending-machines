import { ApiProperty } from '@nestjs/swagger';
import { SnackPileDto } from './snack-pile.dto';

export class SlotDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: Number, minimum: 1, maximum: 3 })
  readonly position!: number;

  @ApiProperty({ type: SnackPileDto })
  readonly snackPile!: SnackPileDto;

  constructor(id: string, position: number, snackPile: SnackPileDto) {
    this.id = id;
    this.position = position;
    this.snackPile = snackPile;
  }
}
