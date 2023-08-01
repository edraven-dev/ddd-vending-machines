import Currency from 'currency.js';
import { Money } from '../../../src/app/snack-machine/money';

describe('Money', () => {
  it('should produce the correct sum', () => {
    const money1 = new Money(1, 2, 3, 4, 5, 6);
    const money2 = new Money(1, 2, 3, 4, 5, 6);

    const sum = Money.add(money1, money2);

    expect(sum).toEqual(new Money(2, 4, 6, 8, 10, 12));
  });

  it('should produce the correct subtraction', () => {
    const money1 = new Money(1, 2, 3, 4, 5, 6);
    const money2 = new Money(1, 2, 3, 4, 5, 6);

    const subtraction = Money.subtract(money1, money2);

    expect(subtraction).toEqual(Money.None);
  });

  it('should prevent subtraction of a greater money from a smaller one', () => {
    const money1 = new Money(1, 2, 3, 4, 5, 6);
    const money2 = new Money(1, 2, 3, 4, 5, 7);

    expect(() => Money.subtract(money1, money2)).toThrowError('Invalid operation');
  });

  it('should be equal to another money object with the same values', () => {
    const money1 = new Money(1, 2, 3, 4, 5, 6);
    const money2 = new Money(1, 2, 3, 4, 5, 6);

    expect(money1).toEqual(money2);
  });

  it('should not be equal to another money object with different values', () => {
    const money1 = new Money(1, 2, 3, 4, 5, 6);
    const money2 = new Money(1, 2, 3, 4, 5, 7);

    expect(money1).not.toEqual(money2);
  });

  it('should prevent create the money object with negative values', () => {
    const moneyQuantsArray: [number, number, number, number, number, number][] = [
      [-1, 2, 3, 4, 5, 6],
      [1, -2, 3, 4, 5, 6],
      [1, 2, -3, 4, 5, 6],
      [1, 2, 3, -4, 5, 6],
      [1, 2, 3, 4, -5, 6],
      [1, 2, 3, 4, 5, -6],
    ];

    moneyQuantsArray.forEach((moneyQuants) => {
      expect(() => new Money(...moneyQuants)).toThrowError('Invalid operation');
    });
  });

  it('should calculate the amount correctly', () => {
    const money = new Money(1, 2, 3, 4, 5, 6);

    expect(money.amount).toEqual(new Currency(149.96));
  });
});
