import { Injectable } from '@nestjs/common';
import { AggregateRoot, InvalidOperationError } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Money } from './money';
import { Slot } from './slot';
import { SnackPile } from './snack-pile';

@Injectable()
export class SnackMachine extends AggregateRoot {
  moneyInside: Money = Money.None;
  moneyInTransaction: Currency = new Currency(0);
  readonly slots: Slot[] = [new Slot(this, 1), new Slot(this, 2), new Slot(this, 3)];

  insertMoney(money: Money): void {
    const coinAndNotes = [Money.Cent, Money.TenCent, Money.Quarter, Money.Dollar, Money.FiveDollar, Money.TwentyDollar];
    if (!coinAndNotes.some((coinOrNote) => coinOrNote.equals(money))) {
      throw new InvalidOperationError('Invalid coin or note');
    }

    this.moneyInTransaction = this.moneyInTransaction.add(money.amount);
    this.moneyInside = Money.add(this.moneyInside, money);
  }

  returnMoney(): void {
    const moneyToReturn: Money = this.moneyInside.allocate(this.moneyInTransaction);
    this.moneyInside = Money.subtract(this.moneyInside, moneyToReturn);
    this.moneyInTransaction = new Currency(0);
  }

  buySnack(position: number): void {
    const slot = this.getSlotByPosition(position);
    if (slot.snackPile.price.intValue > this.moneyInTransaction.intValue) {
      throw new InvalidOperationError('Not enough money inserted to buy a snack');
    }
    slot.snackPile = slot.snackPile.subtractOne();

    const change = this.moneyInside.allocate(this.moneyInTransaction.subtract(slot.snackPile.price));
    if (change.amount.intValue < this.moneyInTransaction.intValue - slot.snackPile.price.intValue) {
      throw new InvalidOperationError('Not enough change');
    }

    this.moneyInside = Money.subtract(this.moneyInside, change);
    this.moneyInTransaction = new Currency(0);
  }

  getSnackPile(position: number): SnackPile {
    return this.getSlotByPosition(position).snackPile;
  }

  loadSnacks(position: number, snackPile: SnackPile): void {
    this.getSlotByPosition(position).snackPile = snackPile;
  }

  loadMoney(money: Money): void {
    this.moneyInside = Money.add(this.moneyInside, money);
  }

  private getSlotByPosition(position: number): Slot {
    const slot = this.slots.find((slot) => slot.position === position);
    if (!slot) {
      throw new InvalidOperationError(`Slot at position ${position} does not exist`);
    }
    return slot;
  }
}
