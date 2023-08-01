import Currency from 'currency.js';
import { Money } from '../../../src/app/snack-machine/money';
import { SnackMachine } from '../../../src/app/snack-machine/snack-machine';

describe('Snack Machine', () => {
  it('should empties money in transaction when returning money', () => {
    const snackMachine = new SnackMachine();
    snackMachine.insertMoney(Money.Dollar);

    snackMachine.returnMoney();

    expect(snackMachine.moneyInTransaction.amount).toEqual(new Currency(0));
  });

  it('should add inserted money to money in transaction', () => {
    const snackMachine = new SnackMachine();

    snackMachine.insertMoney(Money.Cent);
    snackMachine.insertMoney(Money.Dollar);

    expect(snackMachine.moneyInTransaction.amount).toEqual(new Currency(1.01));
  });

  it('should prevent inserting more than one coin at a time', () => {
    const snackMachine = new SnackMachine();
    const twoCent = Money.add(Money.Cent, Money.Cent);

    expect(() => snackMachine.insertMoney(twoCent)).toThrowError('Invalid operation');
  });

  it('should add money in transaction to money inside when buying a snack', () => {
    const snackMachine = new SnackMachine();
    snackMachine.insertMoney(Money.Dollar);
    snackMachine.insertMoney(Money.Dollar);

    snackMachine.buySnack();

    expect(snackMachine.moneyInside.amount).toEqual(new Currency(2.0));
    expect(snackMachine.moneyInTransaction.amount).toEqual(new Currency(0));
  });
});
