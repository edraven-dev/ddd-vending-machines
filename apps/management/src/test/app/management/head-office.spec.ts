import { AggregateType, HeadOfficeDeletedEvent } from '@vending-machines/events';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOffice } from '../../../app/management/head-office';

describe('HeadOffice', () => {
  const firstAtmId = Id.generate();
  const secondAtmId = Id.generate();
  const firstSnackMachineId = Id.generate();
  const secondSnackMachineId = Id.generate();
  const aHeadOffice = (expiresAt = new Date()) =>
    new HeadOffice(Id.generate(), [firstAtmId, secondAtmId], [firstSnackMachineId, secondSnackMachineId], expiresAt);

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#hasAtm', () => {
    it('should return true for each owned atm id, given as a separate but equal Id', () => {
      const headOffice = aHeadOffice();

      expect(headOffice.hasAtm(Id.from(firstAtmId.value))).toBe(true);
      expect(headOffice.hasAtm(Id.from(secondAtmId.value))).toBe(true);
    });

    it('should return false for an id that is not one of its atms', () => {
      const headOffice = aHeadOffice();

      expect(headOffice.hasAtm(Id.generate())).toBe(false);
      expect(headOffice.hasAtm(firstSnackMachineId)).toBe(false);
    });
  });

  describe('#hasSnackMachine', () => {
    it('should return true for each owned snack machine id, given as a separate but equal Id', () => {
      const headOffice = aHeadOffice();

      expect(headOffice.hasSnackMachine(Id.from(firstSnackMachineId.value))).toBe(true);
      expect(headOffice.hasSnackMachine(Id.from(secondSnackMachineId.value))).toBe(true);
    });

    it('should return false for an id that is not one of its snack machines', () => {
      const headOffice = aHeadOffice();

      expect(headOffice.hasSnackMachine(Id.generate())).toBe(false);
      expect(headOffice.hasSnackMachine(firstAtmId)).toBe(false);
    });
  });

  describe('#expire', () => {
    it('should set expiresAt to the current time', () => {
      const now = new Date('2026-11-13T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const headOffice = aHeadOffice(new Date('2026-11-14T12:00:00.000Z'));

      headOffice.expire();

      expect(headOffice.expiresAt).toStrictEqual(now);
    });
  });

  describe('#delete', () => {
    it('should apply HeadOfficeDeletedEvent', () => {
      const headOffice = aHeadOffice();
      const apply = vi.spyOn(headOffice, 'apply');

      headOffice.delete();

      expect(apply).toHaveBeenCalledWith(expect.any(HeadOfficeDeletedEvent));
      expect(apply).toHaveBeenCalledWith(
        expect.objectContaining({ aggregateId: headOffice.id.value, aggregateType: AggregateType.HeadOffice }),
      );
    });
  });

  describe('#changeBalance', () => {
    it('should add amount to the balance', () => {
      const headOffice = aHeadOffice();
      headOffice.balance = new Currency(10);

      headOffice.changeBalance(new Currency(10));

      expect(headOffice.balance).toEqual(new Currency(20));
    });
  });

  describe('#loadCash', () => {
    it('should add money to cash', () => {
      const headOffice = aHeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);

      headOffice.loadCash(new Money(1, 1, 1, 1, 1, 1));

      expect(headOffice.cash).toEqual(new Money(2, 2, 2, 2, 2, 2));
    });
  });

  describe('#unloadCash', () => {
    it('should return cash and set it to None', () => {
      const headOffice = aHeadOffice();
      headOffice.cash = new Money(1, 1, 1, 1, 1, 1);

      const result = headOffice.unloadCash();

      expect(result).toEqual(new Money(1, 1, 1, 1, 1, 1));
      expect(headOffice.cash).toEqual(Money.None);
    });

    it('should return None if cash is None', () => {
      const headOffice = aHeadOffice();
      headOffice.cash = Money.None;

      const result = headOffice.unloadCash();

      expect(result).toEqual(Money.None);
      expect(headOffice.cash).toEqual(Money.None);
    });
  });
});
