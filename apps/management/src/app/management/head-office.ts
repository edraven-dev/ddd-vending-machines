import { AggregateType, HeadOfficeDeletedEvent } from '@vending-machines/events';
import { AggregateRoot, type Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class HeadOffice extends AggregateRoot {
  balance: Currency = new Currency(0);
  cash: Money = Money.None;
  readonly atmIds: readonly Id[];
  readonly snackMachineIds: readonly Id[];
  readonly expiresAt: Date;

  constructor(id: Id, atmIds: readonly Id[], snackMachineIds: readonly Id[], expiresAt: Date) {
    super(id);
    this.atmIds = atmIds;
    this.snackMachineIds = snackMachineIds;
    this.expiresAt = expiresAt;
  }

  hasAtm(atmId: Id): boolean {
    return this.atmIds.some((id) => id.equals(atmId));
  }

  hasSnackMachine(snackMachineId: Id): boolean {
    return this.snackMachineIds.some((id) => id.equals(snackMachineId));
  }

  changeBalance(delta: Currency): void {
    this.balance = this.balance.add(delta);
  }

  loadCash(cash: Money): void {
    this.cash = Money.add(this.cash, cash);
  }

  unloadCash(): Money {
    const moneyToReturn = this.cash;
    this.cash = Money.None;
    return moneyToReturn;
  }

  delete(): void {
    this.apply(
      new HeadOfficeDeletedEvent({ aggregateId: this.id, aggregateType: AggregateType.HeadOffice, payload: {} }),
    );
  }
}
