import { AggregateType, HeadOfficeDeletedEvent } from '@vending-machines/events';
import { AggregateRoot, type Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class HeadOffice extends AggregateRoot {
  balance: Currency = new Currency(0);
  cash: Money = Money.None;
  readonly atmId: Id;
  readonly snackMachineId: Id;
  readonly expiresAt: Date;

  constructor(id: Id, atmId: Id, snackMachineId: Id, expiresAt: Date) {
    super(id);
    this.atmId = atmId;
    this.snackMachineId = snackMachineId;
    this.expiresAt = expiresAt;
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
