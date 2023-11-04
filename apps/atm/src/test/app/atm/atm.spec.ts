import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Atm } from '../../../app/atm/atm';

describe('Atm', () => {
  describe('takeMoney', () => {
    it('should exchange money with commission', async () => {
      const atm = new Atm();
      atm.loadMoney(Money.Dollar);

      atm.takeMoney(new Currency(1.0));

      expect(atm.moneyInside.amount).toEqual(new Currency(0.0));
      expect(atm.moneyCharged).toEqual(new Currency(1.01));
    });

    it('should take at least one cent as commission', async () => {
      const atm = new Atm();
      atm.loadMoney(Money.Cent);

      atm.takeMoney(new Currency(0.01));

      expect(atm.moneyCharged).toEqual(new Currency(0.02));
    });

    it('should round commission up to the nearest cent', async () => {
      const atm = new Atm();
      atm.loadMoney(Money.add(Money.Dollar, Money.TenCent));

      atm.takeMoney(new Currency(1.1));

      expect(atm.moneyCharged).toEqual(new Currency(1.12));
    });

    it('should throw when taking negative amount', async () => {
      const atm = new Atm();

      expect(() => atm.takeMoney(new Currency(-1))).toThrow('Invalid amount');
    });

    it('should throw when taking zero amount', async () => {
      const atm = new Atm();

      expect(() => atm.takeMoney(new Currency(0))).toThrow('Invalid amount');
    });

    it('should throw when taking more money than inside', async () => {
      const atm = new Atm();
      atm.loadMoney(Money.Dollar);

      expect(() => atm.takeMoney(new Currency(2))).toThrow('Not enough money');
    });

    it('should throw when taking money that cannot be allocated', async () => {
      const atm = new Atm();
      atm.loadMoney(Money.Dollar);

      expect(() => atm.takeMoney(new Currency(0.1))).toThrow('Not enough change');
    });
  });
});
