import { ApiProperty } from '@nestjs/swagger';
import { SnackDto } from '../../snack/dto/snack.dto';

export class SnackPileDto {
  @ApiProperty({ type: SnackDto })
  readonly snack!: SnackDto;

  @ApiProperty({ type: Number, default: 10, minimum: 0 })
  readonly quantity!: number;

  @ApiProperty({ type: String, default: '1.00' })
  readonly price!: string;

  constructor(snack: SnackDto, quantity: number, price: string) {
    this.snack = snack;
    this.quantity = quantity;
    this.price = price;
  }
}
