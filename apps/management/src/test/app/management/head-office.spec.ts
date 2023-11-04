import Currency from 'currency.js';
import { HeadOffice } from '../../../app/management/head-office';

describe('HeadOffice', () => {
  describe('changeBalance', () => {
    it('should add amount to the balance', () => {
      const headOffice = new HeadOffice();
      headOffice.balance = new Currency(10);

      headOffice.changeBalance(new Currency(10));

      expect(headOffice.balance).toEqual(new Currency(20));
    });
  });
});
