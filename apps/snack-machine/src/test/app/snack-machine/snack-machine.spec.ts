import {
  AggregateType,
  MoneyInsertedEvent,
  MoneyLoadedEvent,
  MoneyUnloadedEvent,
  SnackBoughtEvent,
  SnackMachineDeletedEvent,
  SnacksLoadedEvent,
} from '@vending-machines/events';
import { Id, InvalidOperationException, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackPile } from '../../../app/snack-machine/snack-pile';
import { Snack } from '../../../app/snack/snack';

describe('SnackMachine', () => {
  const slotState = (position: number, snackPile = SnackPile.Empty) => ({ id: Id.generate(), position, snackPile });

  describe('.create', () => {
    it('should create three empty slots with distinct ids that point at the machine', () => {
      const snackMachine = SnackMachine.create(Id.generate());

      expect(snackMachine.slots.map((slot) => slot.position)).toEqual([1, 2, 3]);
      expect(snackMachine.slots.every((slot) => slot.snackPile === SnackPile.Empty)).toBe(true);
      expect(snackMachine.slots.every((slot) => slot.snackMachine === snackMachine)).toBe(true);
      expect(new Set(snackMachine.slots.map((slot) => slot.id.value)).size).toBe(3);
    });
  });

  describe('.restore', () => {
    it('should restore the given state with slots ordered by position', () => {
      const id = Id.generate();
      const gum = new SnackPile(Snack.Gum, 2, new Currency('1.00'));
      const slots = [slotState(3), slotState(1, gum), slotState(2)];

      const snackMachine = SnackMachine.restore(id, slots, Money.Dollar, new Currency('0.25'));

      expect(snackMachine.id).toBe(id);
      expect(snackMachine.moneyInside).toEqual(Money.Dollar);
      expect(snackMachine.moneyInTransaction).toEqual(new Currency('0.25'));
      expect(snackMachine.slots.map((slot) => slot.id)).toEqual([slots[1].id, slots[2].id, slots[0].id]);
      expect(snackMachine.getSnackPile(1)).toBe(gum);
      expect(snackMachine.slots.every((slot) => slot.snackMachine === snackMachine)).toBe(true);
    });

    it.each([
      ['a missing slot', [1, 2]],
      ['a duplicated position', [1, 1, 2]],
      ['an unknown position', [1, 2, 4]],
      ['an extra slot', [1, 2, 3, 4]],
    ])('should throw on %s', (_, positions) => {
      const slots = positions.map((position) => slotState(position));

      expect(() => SnackMachine.restore(Id.generate(), slots, Money.None, new Currency(0))).toThrow(
        'must have one slot at each position 1, 2, 3',
      );
    });
  });

  describe('#returnMoney', () => {
    it('should empties money in transaction when returning money', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.insertMoney(Money.Dollar);

      snackMachine.returnMoney();

      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
    });

    it('should return money with highest denomination first', () => {
      const snackMachine = SnackMachine.create(Id.generate());
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
      const snackMachine = SnackMachine.create(Id.generate());

      snackMachine.insertMoney(Money.Cent);
      snackMachine.insertMoney(Money.Dollar);

      expect(snackMachine.moneyInTransaction).toEqual(new Currency(1.01));
    });

    it('should prevent inserting more than one coin at a time', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      const twoCent = Money.add(Money.Cent, Money.Cent);

      expect(() => snackMachine.insertMoney(twoCent)).toThrow('Invalid coin or note');
    });

    it('should apply MoneyInsertedEvent when inserting money', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.insertMoney(Money.Dollar);

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyInsertedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
          payload: { insertedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });

  describe('#buySnack', () => {
    it('should release a snack when buying', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);

      snackMachine.buySnack(1);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.0));
      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
      expect(snackMachine.getSnackPile(1).quantity).toEqual(9);
    });

    it('should prevent buying when there is no snack', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 0, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('The snack pile is empty');
    });

    it('should prevent buying when there is not enough money', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(5.0)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('Not enough money inserted to buy a snack');
    });

    it('should return change when buying with more money than the item price', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(0.5)));
      snackMachine.loadMoney(Money.multiply(Money.TenCent, 10));

      snackMachine.insertMoney(Money.Dollar);
      snackMachine.buySnack(1);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.5));
      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
    });

    it('should prevent buying when there is not enough change', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(0.5)));
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.buySnack(1)).toThrow('Not enough change');
    });

    it('should prevent buying when the slot at position does not exist', () => {
      const snackMachine = SnackMachine.create(Id.generate());

      expect(() => snackMachine.buySnack(4)).toThrow('Slot at position 4 does not exist');
    });

    it('should apply SnackBoughtEvent when buying', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));
      snackMachine.insertMoney(Money.Dollar);
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.buySnack(1);

      expect(spy).toHaveBeenCalledWith(expect.any(SnackBoughtEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
          payload: expect.objectContaining({ slotPosition: 1 }),
        }),
      );
    });
  });

  describe('#getSnackPile', () => {
    it('should return snack pile at position', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      const snackPile = snackMachine.getSnackPile(1);

      expect(snackPile.snack).toEqual(Snack.Chocolate);
      expect(snackPile.quantity).toEqual(10);
      expect(snackPile.price).toEqual(new Currency(1.0));
    });
  });

  describe('#loadSnacks', () => {
    it('should add snack to slot', () => {
      const snackMachine = SnackMachine.create(Id.generate());

      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      expect(snackMachine.getSnackPile(1).quantity).toEqual(10);
    });

    it('should prevent loading snacks to a slot that does not exist', () => {
      const snackMachine = SnackMachine.create(Id.generate());

      expect(() => snackMachine.loadSnacks(4, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)))).toThrow(
        'Slot at position 4 does not exist',
      );
    });

    it('should apply SnacksLoadedEvent when loading snacks', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency(1.0)));

      expect(spy).toHaveBeenCalledWith(expect.any(SnacksLoadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
          payload: {
            slotPosition: 1,
            snackId: Snack.Chocolate.id.value,
            snackPileQuantity: 10,
            snackPrice: new Currency(1.0).format({ symbol: '' }),
          },
        }),
      );
    });
  });

  describe('#loadMoney', () => {
    it('should add money to money inside', () => {
      const snackMachine = SnackMachine.create(Id.generate());

      snackMachine.loadMoney(Money.Dollar);

      expect(snackMachine.moneyInside.amount).toEqual(new Currency(1.0));
    });

    it('should apply MoneyLoadedEvent when loading money', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.loadMoney(Money.Dollar);

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyLoadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
          payload: { loadedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });

  describe('#unloadMoney', () => {
    it('should throw when unloading money during transaction', async () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.insertMoney(Money.Dollar);

      expect(() => snackMachine.unloadMoney()).toThrow(InvalidOperationException);
    });

    it('should return money and set it to None', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadMoney(Money.Dollar);

      const result = snackMachine.unloadMoney();

      expect(result).toEqual(Money.Dollar);
      expect(snackMachine.moneyInside).toEqual(Money.None);
    });

    it('should return None if money inside is None', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.moneyInside = Money.None;

      const result = snackMachine.unloadMoney();

      expect(result).toEqual(Money.None);
      expect(snackMachine.moneyInside).toEqual(Money.None);
    });

    it('should apply MoneyUnloadedEvent when unloading money', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      snackMachine.loadMoney(Money.Dollar);
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.unloadMoney();

      expect(spy).toHaveBeenCalledWith(expect.any(MoneyUnloadedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
          payload: { unloadedMoney: Money.Dollar.toCoinsAndNotes() },
        }),
      );
    });
  });

  describe('#markAsDeleted', () => {
    it('should apply HeadOfficeDeletedEvent when marking as deleted', () => {
      const snackMachine = SnackMachine.create(Id.generate());
      const spy = vi.spyOn(snackMachine, 'apply');

      snackMachine.markAsDeleted();

      expect(spy).toHaveBeenCalledWith(expect.any(SnackMachineDeletedEvent));
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: snackMachine.id.value,
          aggregateType: AggregateType.SnackMachine,
        }),
      );
    });
  });
});
