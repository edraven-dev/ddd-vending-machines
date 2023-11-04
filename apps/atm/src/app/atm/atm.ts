import { AggregateRoot, InvalidOperationException, Money } from '@vending-machines/shared';
import Currency from 'currency.js';

export class Atm extends AggregateRoot {
  moneyInside: Money = Money.None;
  moneyCharged: Currency;
  private readonly commissionRate = new Currency(0.01);

  loadMoney(money: Money): void {
    this.moneyInside = Money.add(this.moneyInside, money);
  }

  canTakeMoney(amount: Currency): string {
    if (amount <= new Currency(0)) {
      return 'Invalid amount';
    }

    if (this.moneyInside.amount.value < amount.value) {
      return 'Not enough money';
    }

    if (!this.moneyInside.canAllocate(amount)) {
      return 'Not enough change';
    }

    return '';
  }

  takeMoney(amount: Currency): void {
    const takeMoneyError = this.canTakeMoney(amount);
    if (takeMoneyError !== '') {
      throw new InvalidOperationException(takeMoneyError);
    }

    const output = this.moneyInside.allocate(amount);
    this.moneyInside = Money.subtract(this.moneyInside, output);

    const amountWithCommission = this.calculateAmountWithCommission(amount);
    this.moneyCharged = amountWithCommission;
  }

  private calculateAmountWithCommission(amount: Currency): Currency {
    const commission = amount.value * this.commissionRate.value;
    const lessThanCent = commission % this.commissionRate.value;
    if (lessThanCent > 0) {
      return amount.add(commission).subtract(lessThanCent).add(this.commissionRate);
    }
    return amount.add(commission);
  }
}
