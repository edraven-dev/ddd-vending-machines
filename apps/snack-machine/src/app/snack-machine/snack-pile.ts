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
    if (price.intValue % 1 !== 0 || new Currency(price.value).value !== price.value) {
      throw new InvalidOperationException('Price cannot contain part of cent');
    }
    this.snack = snack;
    this.quantity = quantity;
    this.price = price;
  }

  subtractOne(): SnackPile {
    return new SnackPile(this.snack, this.quantity - 1, this.price);
  }

  addQuantity(quantity: number): SnackPile {
    if (this.snack.equals(Snack.None)) {
      throw new InvalidOperationException('Cannot add quantity to an empty snack pile');
    }
    return new SnackPile(this.snack, this.quantity + quantity, this.price);
  }

  protected equalsCore(other: SnackPile): boolean {
    return this.snack.equals(other.snack) && this.quantity === other.quantity && this.price.value === other.price.value;
  }
}
