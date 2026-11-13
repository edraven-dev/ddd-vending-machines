import {
  AggregateType,
  MoneyInsertedEvent,
  MoneyLoadedEvent,
  MoneyReturnedEvent,
  MoneyUnloadedEvent,
  SnackBoughtEvent,
  SnackMachineDeletedEvent,
  SnacksLoadedEvent,
} from '@vending-machines/events';
import { AggregateRoot, Id, InvalidOperationException, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Slot } from './slot';
import { SnackPile } from './snack-pile';

const SLOT_POSITIONS = [1, 2, 3];

type SlotState = Pick<Slot, 'id' | 'position' | 'snackPile'>;

export class SnackMachine extends AggregateRoot {
  moneyInside: Money;
  moneyInTransaction: Currency;
  readonly slots: readonly Slot[];

  private constructor(id: Id, slots: readonly SlotState[], moneyInside: Money, moneyInTransaction: Currency) {
    super(id);
    this.slots = slots.map((slot) => new Slot(slot.id, this, slot.position, slot.snackPile));
    this.moneyInside = moneyInside;
    this.moneyInTransaction = moneyInTransaction;
  }

  static create(id: Id): SnackMachine {
    const slots = SLOT_POSITIONS.map((position) => ({ id: Id.generate(), position, snackPile: SnackPile.Empty }));
    return new SnackMachine(id, slots, Money.None, new Currency(0));
  }

  static restore(id: Id, slots: readonly SlotState[], moneyInside: Money, moneyInTransaction: Currency): SnackMachine {
    const sorted = slots.toSorted((a, b) => a.position - b.position);
    if (
      sorted.length !== SLOT_POSITIONS.length ||
      sorted.some((slot, index) => slot.position !== SLOT_POSITIONS[index])
    ) {
      throw new Error(`Snack machine ${id.value} must have one slot at each position ${SLOT_POSITIONS.join(', ')}`);
    }
    return new SnackMachine(id, sorted, moneyInside, moneyInTransaction);
  }

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
        aggregateType: AggregateType.SnackMachine,
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
        aggregateType: AggregateType.SnackMachine,
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
        aggregateType: AggregateType.SnackMachine,
        payload: {
          slotPosition: position,
          snackId: slot.snackPile.snack.id.value,
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
        aggregateType: AggregateType.SnackMachine,
        payload: {
          slotPosition: position,
          snackId: snackPile.snack.id.value,
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
        aggregateType: AggregateType.SnackMachine,
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
        aggregateType: AggregateType.SnackMachine,
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
      new SnackMachineDeletedEvent({ aggregateId: this.id, aggregateType: AggregateType.SnackMachine, payload: {} }),
    );
  }
}
