import {
  MoneyInsertedEvent,
  MoneyLoadedEvent,
  MoneyUnloadedEvent,
  SnackBoughtEvent,
  SnacksLoadedEvent,
} from '@vending-machines/events';
import { InvalidOperationException, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackPile } from '../../../app/snack-machine/snack-pile';
import { Snack } from '../../../app/snack/snack';

describe('SnackMachine', () => {
  describe('#returnMoney', () => {
    it('should empties money in transaction when returning money', () => {
      const snackMachine = new SnackMachine();
      snackMachine.insertMoney(Money.Dollar);

      snackMachine.returnMoney();

      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
    });

    it('should return money with highest denomination first', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadMoney(Money.Dollar);

      snackMachine.insertMoney(Money.Quarter);
      snackMachine.insertMoney(Money.Quarter);
      snackMachine.insertMoney(Money.Quarter);
      snackMachine.insertMoney(Money.Quarter);
      snackMachine.returnMoney();

      expect(snackMachine.moneyInside.quarterCount).toEqual(4);
      expect(snackMachine.moneyInside.oneDollarCount).toEqual(0);
    });
  });

  describe('#insertMoney', () => {
    it('should add inserted money to money in transaction', () => {
      const snackMachine = new SnackMachine();

      snackMachine.insertMoney(Money.Cent);
      snackMachine.insertMoney(Money.Dollar);

      expect(snackMachine.moneyInTransaction).toEqual(new Currency(1.01));
    });

    it('should prevent inserting more than one coin at a time', () => {
      const snackMachine = new SnackMachine();
      const twoCent = Money.add(Money.Cent, Money.Cent);

      expect(() => snackMachine.insertMoney(twoCent)).toThrow('Invalid coin or note');
    });

    it('should apply MoneyInsertedEvent when inserting money', () => {
      const snackMachine = new SnackMachine();
      const spy = jest.spyOn(snackMachine, 'apply');

      snackMachine.insertMoney(Money.Dollar);

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyInsertedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id,
          aggregateType: snackMachine.constructor.name,
          payload: { insertedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });

  describe('#buySnack', () => {
    it('should release a snack when buying', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);

      snackMachine.buySnack(1);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.0));
      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
      expect(snackMachine.getSnackPile(1).quantity).toEqual(9);
    });

    it('should prevent buying when there is no snack', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 0, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('The snack pile is empty');
    });

    it('should prevent buying when there is not enough money', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(5.0)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('Not enough money inserted to buy a snack');
    });

    it('should return change when buying with more money than the item price', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(0.5)));
      snackMachine.loadMoney(Money.multiply(Money.TenCent, 10));

      snackMachine.insertMoney(Money.Dollar);
      snackMachine.buySnack(1);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.5));
      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
    });

    it('should prevent buying when there is not enough change', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(0.5)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('Not enough change');
    });

    it('should prevent buying when the slot at position does not exist', () => {
      const snackMachine = new SnackMachine();

      expect(() => snackMachine.buySnack(4)).toThrow('Slot at position 4 does not exist');
    });

    it('should apply SnackBoughtEvent when buying', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);
      const spy = jest.spyOn(snackMachine, 'apply');

      snackMachine.buySnack(1);

      expect(spy).toHaveBeenCalledWith(expect.any(SnackBoughtEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id,
          aggregateType: snackMachine.constructor.name,
          payload: expect.objectContaining({ slotPosition: 1 }),
        }),
      );
    });
  });

  describe('#getSnackPile', () => {
    it('should return snack pile at position', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      const snackPile = snackMachine.getSnackPile(1);

      expect(snackPile.snack).toEqual(Snack.Chocolate);
      expect(snackPile.quantity).toEqual(10);
      expect(snackPile.price).toEqual(new Currency(1.0));
    });
  });

  describe('#loadSnacks', () => {
    it('should add snack to slot', () => {
      const snackMachine = new SnackMachine();

      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      expect(snackMachine.getSnackPile(1).quantity).toEqual(10);
    });

    it('should prevent loading snacks to a slot that does not exist', () => {
      const snackMachine = new SnackMachine();

      expect(() => snackMachine.loadSnacks(4, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)))).toThrow(
        'Slot at position 4 does not exist',
      );
    });

    it('should apply SnacksLoadedEvent when loading snacks', () => {
      const snackMachine = new SnackMachine();
      const spy = jest.spyOn(snackMachine, 'apply');

      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      expect(spy).toHaveBeenCalledWith(expect.any(SnacksLoadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id,
          aggregateType: snackMachine.constructor.name,
          payload: {
            slotPosition: 1,
            snackId: Snack.Chocolate.id,
            snackPileQuantity: 10,
            snackPrice: new Currency(1.0).format({ symbol: '' }),
          },
        }),
      );
    });
  });

  describe('#loadMoney', () => {
    it('should add money to money inside', () => {
      const snackMachine = new SnackMachine();

      snackMachine.loadMoney(Money.Dollar);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.0));
    });

    it('should apply MoneyLoadedEvent when loading money', () => {
      const snackMachine = new SnackMachine();
      const spy = jest.spyOn(snackMachine, 'apply');

      snackMachine.loadMoney(Money.Dollar);

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyLoadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id,
          aggregateType: snackMachine.constructor.name,
          payload: { loadedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });

  describe('#unloadMoney', () => {
    it('should throw when unloading money during transaction', async () => {
      const snackMachine = new SnackMachine();
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.unloadMoney()).toThrow(InvalidOperationException);
    });

    it('should return money and set it to None', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadMoney(Money.Dollar);

      const result = snackMachine.unloadMoney();

      expect(result).toEqual(Money.Dollar);
      expect(snackMachine.moneyInside).toEqual(Money.None);
    });

    it('should return None if money inside is None', () => {
      const snackMachine = new SnackMachine();
      snackMachine.moneyInside = Money.None;

      const result = snackMachine.unloadMoney();

      expect(result).toEqual(Money.None);
      expect(snackMachine.moneyInside).toEqual(Money.None);
    });

    it('should apply MoneyUnloadedEvent when unloading money', () => {
      const snackMachine = new SnackMachine();
      snackMachine.loadMoney(Money.Dollar);
      const spy = jest.spyOn(snackMachine, 'apply');

      snackMachine.unloadMoney();

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyUnloadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id,
          aggregateType: snackMachine.constructor.name,
          payload: { unloadedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });
});
