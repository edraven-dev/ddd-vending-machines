import { Injectable } from '@nestjs/common';
import {
  MoneyInsertedEvent,
  MoneyLoadedEvent,
  MoneyReturnedEvent,
  MoneyUnloadedEvent,
  SnackBoughtEvent,
  SnackMachineDeletedEvent,
  SnacksLoadedEvent,
} from '@vending-machines/events';
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
    this.apply(
      new MoneyInsertedEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: { insertedMoney: money.toCoinsAndNotes() },
      }),
    );
  }

  returnMoney(): void {
    const moneyToReturn: Money = this.moneyInside.allocate(this.moneyInTransaction);
    this.moneyInside = Money.subtract(this.moneyInside, moneyToReturn);
    this.moneyInTransaction = new Currency(0);
    this.apply(
      new MoneyReturnedEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: { returnedMoney: moneyToReturn.toCoinsAndNotes() },
      }),
    );
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
    this.apply(
      new SnackBoughtEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: {
          slotPosition: position,
          snackId: slot.snackPile.snack.id,
          snackPrice: slot.snackPile.price.format({ symbol: '' }),
          snackPileQuantity: slot.snackPile.quantity,
        },
      }),
    );
  }

  getSnackPile(position: number): SnackPile {
    return this.getSlotByPosition(position).snackPile;
  }

  loadSnacks(position: number, snackPile: SnackPile): void {
    this.getSlotByPosition(position).snackPile = snackPile;
    this.apply(
      new SnacksLoadedEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: {
          slotPosition: position,
          snackId: snackPile.snack.id,
          snackPileQuantity: snackPile.quantity,
          snackPrice: snackPile.price.format({ symbol: '' }),
        },
      }),
    );
  }

  loadMoney(money: Money): void {
    this.moneyInside = Money.add(this.moneyInside, money);
    this.apply(
      new MoneyLoadedEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: { loadedMoney: this.moneyInside.toCoinsAndNotes() },
      }),
    );
  }

  unloadMoney(): Money {
    if (this.moneyInTransaction.intValue > 0) {
      throw new InvalidOperationException('Cannot unload money during transaction');
    }
    const moneyToReturn = this.moneyInside;
    this.moneyInside = Money.None;
    this.apply(
      new MoneyUnloadedEvent({
        aggregateId: this.id,
        aggregateType: this.constructor.name,
        payload: { unloadedMoney: moneyToReturn.toCoinsAndNotes() },
      }),
    );
    return moneyToReturn;
  }

  private getSlotByPosition(position: number): Slot {
    const slot = this.slots.find((slot) => slot.position === position);
    if (!slot) {
      throw new InvalidOperationException(`Slot at position ${position} does not exist`);
    }
    return slot;
  }

  markAsDeleted(): void {
    this.apply(
      new SnackMachineDeletedEvent({ aggregateId: this.id, aggregateType: this.constructor.name, payload: {} }),
    );
  }
}
