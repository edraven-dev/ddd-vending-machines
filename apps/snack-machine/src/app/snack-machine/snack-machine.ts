import { Injectable } from '@nestjs/common';
import { AggregateRoot, InvalidOperationException, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
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
      throw new InvalidOperationException('Invalid coin or note');
    }

    this.moneyInTransaction = this.moneyInTransaction.add(money.amount);
    this.moneyInside = Money.add(this.moneyInside, money);
  }

  returnMoney(): void {
    const moneyToReturn: Money = this.moneyInside.allocate(this.moneyInTransaction);
    this.moneyInside = Money.subtract(this.moneyInside, moneyToReturn);
    this.moneyInTransaction = new Currency(0);
  }

  canBuySnack(position: number): string {
    const snackPile = this.getSnackPile(position);

    if (snackPile.quantity === 0) {
      return 'The snack pile is empty';
    }

    if (this.moneyInTransaction.intValue < snackPile.price.intValue) {
      return 'Not enough money inserted to buy a snack';
    }

    if (!this.moneyInside.canAllocate(this.moneyInTransaction.subtract(snackPile.price))) {
      return 'Not enough change';
    }

    return String();
  }

  buySnack(position: number): void {
    const buySnackError = this.canBuySnack(position);
    if (buySnackError) {
      throw new InvalidOperationException(buySnackError);
    }

    const slot = this.getSlotByPosition(position);
    slot.snackPile = slot.snackPile.subtractOne();

    const change = this.moneyInside.allocate(this.moneyInTransaction.subtract(slot.snackPile.price));
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

  unloadMoney(): Money {
    if (this.moneyInTransaction.intValue > 0) {
      throw new InvalidOperationException('Cannot unload money during transaction');
    }
    const moneyToReturn = this.moneyInside;
    this.moneyInside = Money.None;
    return moneyToReturn;
  }

  private getSlotByPosition(position: number): Slot {
    const slot = this.slots.find((slot) => slot.position === position);
    if (!slot) {
      throw new InvalidOperationException(`Slot at position ${position} does not exist`);
    }
    return slot;
  }
}
