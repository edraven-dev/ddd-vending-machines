import { InvalidOperationError, ValueObject } from '@vending-machines/shared';
import Currency from 'currency.js';

export class Money extends ValueObject {
  static readonly None = new Money(0, 0, 0, 0, 0, 0);
  static readonly Cent = new Money(1, 0, 0, 0, 0, 0);
  static readonly TenCent = new Money(0, 1, 0, 0, 0, 0);
  static readonly Quarter = new Money(0, 0, 1, 0, 0, 0);
  static readonly Dollar = new Money(0, 0, 0, 1, 0, 0);
  static readonly FiveDollar = new Money(0, 0, 0, 0, 1, 0);
  static readonly TwentyDollar = new Money(0, 0, 0, 0, 0, 1);

  readonly oneCentCount: number;
  readonly tenCentCount: number;
  readonly quarterCount: number;
  readonly oneDollarCount: number;
  readonly fiveDollarCount: number;
  readonly twentyDollarCount: number;

  get amount(): Currency {
    return new Currency(this.oneCentCount)
      .multiply(0.01)
      .add(new Currency(this.tenCentCount).multiply(0.1))
      .add(new Currency(this.quarterCount).multiply(0.25))
      .add(new Currency(this.oneDollarCount).multiply(1))
      .add(new Currency(this.fiveDollarCount).multiply(5))
      .add(new Currency(this.twentyDollarCount).multiply(20));
  }

  constructor(
    oneCentCount: number,
    tenCentCount: number,
    quarterCount: number,
    oneDollarCount: number,
    fiveDollarCount: number,
    twentyDollarCount: number,
  ) {
    super();

    const coinAndNoteCounters = [
      oneCentCount,
      tenCentCount,
      quarterCount,
      oneDollarCount,
      fiveDollarCount,
      twentyDollarCount,
    ];
    if (coinAndNoteCounters.some((amount) => amount < 0)) {
      throw new InvalidOperationError('Money components cannot be negative');
    }

    this.oneCentCount = oneCentCount;
    this.tenCentCount = tenCentCount;
    this.quarterCount = quarterCount;
    this.oneDollarCount = oneDollarCount;
    this.fiveDollarCount = fiveDollarCount;
    this.twentyDollarCount = twentyDollarCount;
  }

  static add(money1: Money, money2: Money): Money {
    return new Money(
      money1.oneCentCount + money2.oneCentCount,
      money1.tenCentCount + money2.tenCentCount,
      money1.quarterCount + money2.quarterCount,
      money1.oneDollarCount + money2.oneDollarCount,
      money1.fiveDollarCount + money2.fiveDollarCount,
      money1.twentyDollarCount + money2.twentyDollarCount,
    );
  }

  static subtract(money1: Money, money2: Money): Money {
    return new Money(
      money1.oneCentCount - money2.oneCentCount,
      money1.tenCentCount - money2.tenCentCount,
      money1.quarterCount - money2.quarterCount,
      money1.oneDollarCount - money2.oneDollarCount,
      money1.fiveDollarCount - money2.fiveDollarCount,
      money1.twentyDollarCount - money2.twentyDollarCount,
    );
  }

  static multiply(money: Money, multiplier: number): Money {
    return new Money(
      money.oneCentCount * multiplier,
      money.tenCentCount * multiplier,
      money.quarterCount * multiplier,
      money.oneDollarCount * multiplier,
      money.fiveDollarCount * multiplier,
      money.twentyDollarCount * multiplier,
    );
  }

  protected equalsCore(other: Money): boolean {
    return (
      this.oneCentCount === other.oneCentCount &&
      this.tenCentCount === other.tenCentCount &&
      this.quarterCount === other.quarterCount &&
      this.oneDollarCount === other.oneDollarCount &&
      this.fiveDollarCount === other.fiveDollarCount &&
      this.twentyDollarCount === other.twentyDollarCount
    );
  }

  // TODO: to cover with unit tests
  allocate(amount: Currency): Money {
    let amountAsCents = amount.intValue;

    const twentyDollarCount = Math.min(Math.floor(amountAsCents / 2000), this.twentyDollarCount);
    amountAsCents -= twentyDollarCount * 2000;

    const fiveDollarCount = Math.min(Math.floor(amountAsCents / 500), this.fiveDollarCount);
    amountAsCents -= fiveDollarCount * 500;

    const oneDollarCount = Math.min(Math.floor(amountAsCents / 100), this.oneDollarCount);
    amountAsCents -= oneDollarCount * 100;

    const quarterCount = Math.min(Math.floor(amountAsCents / 25), this.quarterCount);
    amountAsCents -= quarterCount * 25;

    const tenCentCount = Math.min(Math.floor(amountAsCents / 10), this.tenCentCount);
    amountAsCents -= tenCentCount * 10;

    const oneCentCount = Math.min(Math.floor(amountAsCents / 1), this.oneCentCount);
    amountAsCents -= oneCentCount * 1;

    return new Money(oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount);
  }
}
