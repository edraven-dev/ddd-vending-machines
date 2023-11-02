import { InvalidOperationException, ValueObject } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Snack } from '../snack/snack';

export class SnackPile extends ValueObject {
  static readonly Empty = new SnackPile(Snack.None, 0, new Currency(0));

  readonly snack: Snack;
  readonly quantity: number;
  readonly price: Currency;

  constructor(snack: Snack, quantity: number, price: Currency) {
    super();
    if (quantity < 0) {
      throw new InvalidOperationException('Snack quantity cannot be negative');
    }
    if (price.value < 0) {
      throw new InvalidOperationException('Snack price cannot be negative');
    }
    if (price.intValue % 1 !== 0) {
      throw new InvalidOperationException('Price cannot contain part of cent');
    }
    this.snack = snack;
    this.quantity = quantity;
    this.price = price;
  }

  subtractOne(): SnackPile {
    return new SnackPile(this.snack, this.quantity - 1, this.price);
  }

  protected equalsCore(other: SnackPile): boolean {
    return (
      this.snack.id === other.snack.id && this.quantity === other.quantity && this.price.value === other.price.value
    );
  }
}
