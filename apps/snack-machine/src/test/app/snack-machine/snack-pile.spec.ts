import Currency from 'currency.js';
import { SnackPile } from '../../../app/snack-machine/snack-pile';
import { Snack } from '../../../app/snack/snack';

describe('Snack Pile', () => {
  describe('#constructor', () => {
    it('should prevent creating snack pile with negative quantity', () => {
      expect(() => new SnackPile(Snack.Chocolate, -1, new Currency(1.0))).toThrow('Snack quantity cannot be negative');
    });

    it('should prevent creating snack pile with negative price', () => {
      expect(() => new SnackPile(Snack.Chocolate, 0, new Currency(-1.0))).toThrow('Snack price cannot be negative');
    });

    it('should prevent creating snack pile when price contains more than two decimal places', () => {
      const price = new Currency(1.0);
      Object.assign(price, { intValue: 100.5 });
      expect(() => new SnackPile(Snack.Chocolate, 0, price)).toThrow('Price cannot contain part of cent');
    });

    it('should create snack pile with valid values', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 0, new Currency(1.0));

      expect(snackPile.snack).toEqual(Snack.Chocolate);
      expect(snackPile.quantity).toEqual(0);
      expect(snackPile.price).toEqual(new Currency(1.0));
    });
  });

  describe('#subtractOne', () => {
    it('should subtract one from quantity', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      const result = snackPile.subtractOne();

      expect(result.quantity).toEqual(9);
    });

    it('should throw error when subtracting from empty pile', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 0, new Currency(1.0));

      expect(() => snackPile.subtractOne()).toThrow('Snack quantity cannot be negative');
    });

    it('should not change the original pile', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      snackPile.subtractOne();

      expect(snackPile.quantity).toEqual(10);
    });

    it('should return a new pile', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      const result = snackPile.subtractOne();

      expect(result).not.toBe(snackPile);
    });
  });

  describe('#addQuantity', () => {
    it('should add quantity', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      const result = snackPile.addQuantity(5);

      expect(result.quantity).toEqual(15);
    });

    it('should not change the original pile', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      snackPile.addQuantity(5);

      expect(snackPile.quantity).toEqual(10);
    });

    it('should return a new pile', () => {
      const snackPile = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      const result = snackPile.addQuantity(5);

      expect(result).not.toBe(snackPile);
    });
  });

  describe('#equals', () => {
    it('should be equal to another snack pile with the same values', () => {
      const snackPile1 = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));
      const snackPile2 = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));

      expect(snackPile1.equals(snackPile2)).toBe(true);
    });

    it('should not be equal to another snack pile with different values', () => {
      const snackPile1 = new SnackPile(Snack.Chocolate, 10, new Currency(1.0));
      const snackPile2 = new SnackPile(Snack.Chocolate, 10, new Currency(2.0));

      expect(snackPile1.equals(snackPile2)).toBe(false);
    });
  });
});
