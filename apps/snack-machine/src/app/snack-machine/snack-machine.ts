import { Injectable } from '@nestjs/common';
import { AggregateRoot } from '@vending-machines/shared';
import { Money } from './money';

@Injectable()
export class SnackMachine extends AggregateRoot {
  moneyInside: Money = Money.None;
  moneyInTransaction: Money = Money.None;

  insertMoney(money: Money): void {
    const coinAndNotes = [Money.Cent, Money.TenCent, Money.Quarter, Money.Dollar, Money.FiveDollar, Money.TwentyDollar];
    if (!coinAndNotes.some((coinOrNote) => coinOrNote.equals(money))) {
      throw new Error('Invalid operation');
    }

    this.moneyInTransaction = Money.add(this.moneyInTransaction, money);
  }

  returnMoney(): void {
    this.moneyInTransaction = Money.None;
  }

  buySnack(): void {
    this.moneyInside = Money.add(this.moneyInside, this.moneyInTransaction);
    this.moneyInTransaction = Money.None;
  }
}
