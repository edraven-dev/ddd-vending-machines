import { SnackDto } from '../../snack/dto/snack.dto';

export class SnackPileDto {
  readonly snack!: SnackDto;
  readonly quantity!: number;
  readonly price!: string;

  constructor(snack: SnackDto, quantity: number, price: string) {
    this.snack = snack;
    this.quantity = quantity;
    this.price = price;
  }
}
