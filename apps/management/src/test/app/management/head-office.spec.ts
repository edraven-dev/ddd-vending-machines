import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOffice } from '../../../app/management/head-office';

describe('HeadOffice', () => {
  describe('#changeBalance', () => {
    it('should add amount to the balance', () => {
      const headOffice = new HeadOffice();
      headOffice.balance = new Currency(10);

      headOffice.changeBalance(new Currency(10));

      expect(headOffice.balance).toEqual(new Currency(20));
    });
  });

  describe('#loadCash', () => {
    it('should add money to cash', () => {
      const headOffice = new HeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);

      headOffice.loadCash(new Money(1, 1, 1, 1, 1, 1));

      expect(headOffice.cash).toEqual(new Money(2, 2, 2, 2, 2, 2));
    });
  });

  describe('#unloadCash', () => {
    it('should return cash and set it to None', () => {
      const headOffice = new HeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);

      const result = headOffice.unloadCash();

      expect(result).toEqual(new Money(1, 1, 1, 1, 1, 1));
      expect(headOffice.cash).toEqual(Money.None);
    });

    it('should return None if cash is None', () => {
      const headOffice = new HeadOffice();
      headOffice.cash = Money.None;

      const result = headOffice.unloadCash();

      expect(result).toEqual(Money.None);
      expect(headOffice.cash).toEqual(Money.None);
    });
  });
});
