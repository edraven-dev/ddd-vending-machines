import { ValueObject } from '@vending-machines/shared';
import currency from 'currency.js';

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

  get amount(): currency {
    return new currency(this.oneCentCount)
      .multiply(0.01)
      .add(new currency(this.tenCentCount).multiply(0.1))
      .add(new currency(this.quarterCount).multiply(0.25))
      .add(new currency(this.oneDollarCount).multiply(1))
      .add(new currency(this.fiveDollarCount).multiply(5))
      .add(new currency(this.twentyDollarCount).multiply(20));
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

    if (oneCentCount < 0) {
      throw new Error('Invalid operation');
    }
    if (tenCentCount < 0) {
      throw new Error('Invalid operation');
    }
    if (quarterCount < 0) {
      throw new Error('Invalid operation');
    }
    if (oneDollarCount < 0) {
      throw new Error('Invalid operation');
    }
    if (fiveDollarCount < 0) {
      throw new Error('Invalid operation');
    }
    if (twentyDollarCount < 0) {
      throw new Error('Invalid operation');
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
}
