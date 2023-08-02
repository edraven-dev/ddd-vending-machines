import { ValueObject } from '@vending-machines/shared';
import Currency from 'currency.js';
import { MoneyDto } from './dto/money.dto';

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
      throw new Error('Invalid operation');
    }

    this.oneCentCount = oneCentCount;
    this.tenCentCount = tenCentCount;
    this.quarterCount = quarterCount;
    this.oneDollarCount = oneDollarCount;
    this.fiveDollarCount = fiveDollarCount;
    this.twentyDollarCount = twentyDollarCount;
  }

  public toDto(): MoneyDto {
    return new MoneyDto(this.amount);
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
