import Currency from 'currency.js';
import { Money } from '../lib/money';

describe('Money', () => {
  describe('getAmount', () => {
    it('should calculate the amount correctly', () => {
      const money = new Money(1, 2, 3, 4, 5, 6);

      expect(money.amount).toEqual(new Currency(149.96));
    });
  });

  describe('constructor', () => {
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
        expect(() => new Money(...moneyQuants)).toThrow('Money components cannot be negative');
      });
    });
  });

  describe('add', () => {
    it('should produce the correct sum', () => {
      const money1 = new Money(1, 2, 3, 4, 5, 6);
      const money2 = new Money(1, 2, 3, 4, 5, 6);

      const sum = Money.add(money1, money2);

      expect(sum).toEqual(new Money(2, 4, 6, 8, 10, 12));
    });
  });

  describe('subtract', () => {
    it('should produce the correct subtraction', () => {
      const money1 = new Money(1, 2, 3, 4, 5, 6);
      const money2 = new Money(1, 2, 3, 4, 5, 6);

      const subtraction = Money.subtract(money1, money2);

      expect(subtraction).toEqual(Money.None);
    });

    it('should prevent subtraction of a greater money from a smaller one', () => {
      const money1 = new Money(1, 2, 3, 4, 5, 6);
      const money2 = new Money(1, 2, 3, 4, 5, 7);

      expect(() => Money.subtract(money1, money2)).toThrow('Money components cannot be negative');
    });
  });

  describe('multiply', () => {
    it('should produce the correct multiplication', () => {
      const money = new Money(1, 2, 3, 4, 5, 6);

      const multiplication = Money.multiply(money, 2);

      expect(multiplication).toEqual(new Money(2, 4, 6, 8, 10, 12));
    });
  });

  describe('equals', () => {
    it('should be equal to another money object with the same values', () => {
      const money1 = new Money(1, 2, 3, 4, 5, 6);
      const money2 = new Money(1, 2, 3, 4, 5, 6);

      expect(money1.equals(money2)).toBe(true);
    });

    it('should not be equal to another money object with different values', () => {
      const money1 = new Money(1, 2, 3, 4, 5, 6);
      const money2 = new Money(1, 2, 3, 4, 5, 7);

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('allocate', () => {
    it('should allocate the higher denomination and keep the lower denominations', () => {
      const money = new Money(100, 1, 0, 0, 0, 0);

      const result = money.allocate(new Currency(0.1));

      expect(result).toEqual(new Money(0, 1, 0, 0, 0, 0));
    });

    it('should throw exception if there is not enough money to allocate', () => {
      const money = new Money(0, 0, 0, 0, 0, 0);

      expect(() => money.allocate(new Currency(0.1))).toThrow('Amount cannot be allocated');
    });
  });
});
