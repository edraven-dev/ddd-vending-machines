import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { MikroORM } from '@mikro-orm/postgresql';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import HeadOfficeAtmEntity from '../../../../app/database/management/head-office-atm.entity';
import HeadOfficeSnackMachineEntity from '../../../../app/database/management/head-office-snack-machine.entity';
import HeadOfficeEntity from '../../../../app/database/management/head-office.entity';
import { HeadOfficeMapper } from '../../../../app/database/management/head-office.mapper';
import { HeadOffice } from '../../../../app/management/head-office';

describe('HeadOfficeMapper', () => {
  const orm = new MikroORM({
    dbName: 'unused',
    metadataProvider: ReflectMetadataProvider,
    entities: [HeadOfficeEntity, HeadOfficeAtmEntity, HeadOfficeSnackMachineEntity],
  });
  const em = orm.em.fork();
  const expiresAt = new Date('2026-11-14T12:00:00.000Z');
  const cash = {
    oneCentCount: 1,
    tenCentCount: 2,
    quarterCount: 3,
    oneDollarCount: 4,
    fiveDollarCount: 5,
    twentyDollarCount: 6,
  };

  describe('#toDomain', () => {
    const firstAtmId = Id.generate();
    const secondAtmId = Id.generate();
    const firstSnackMachineId = Id.generate();
    const secondSnackMachineId = Id.generate();
    const entity = em.create(HeadOfficeEntity, {
      id: Id.generate().value,
      atms: [{ atmId: firstAtmId.value }, { atmId: secondAtmId.value }],
      snackMachines: [{ snackMachineId: firstSnackMachineId.value }, { snackMachineId: secondSnackMachineId.value }],
      balance: 12.5,
      cash,
      expiresAt,
    });

    it('should map the atms and snack machines to their ids, in order', () => {
      const headOffice = HeadOfficeMapper.toDomain(entity);

      expect(headOffice.atmIds).toEqual([firstAtmId, secondAtmId]);
      expect(headOffice.snackMachineIds).toEqual([firstSnackMachineId, secondSnackMachineId]);
    });

    it('should restore the id, expiry, balance and cash', () => {
      const headOffice = HeadOfficeMapper.toDomain(entity);

      expect(headOffice.id).toEqual(Id.from(entity.id));
      expect(headOffice.expiresAt).toEqual(expiresAt);
      expect(headOffice.balance).toEqual(new Currency(12.5));
      expect(headOffice.cash).toEqual(new Money(1, 2, 3, 4, 5, 6));
    });
  });

  describe('#toPersistence', () => {
    const firstAtmId = Id.generate();
    const secondAtmId = Id.generate();
    const firstSnackMachineId = Id.generate();
    const secondSnackMachineId = Id.generate();
    const headOffice = new HeadOffice(
      Id.generate(),
      [firstAtmId, secondAtmId],
      [firstSnackMachineId, secondSnackMachineId],
      expiresAt,
    );
    headOffice.balance = new Currency(12.5);
    headOffice.cash = new Money(1, 2, 3, 4, 5, 6);

    it('should write the atms and snack machines as items keyed by their ids', () => {
      const data = HeadOfficeMapper.toPersistence(headOffice);

      expect(data.atms).toEqual([{ atmId: firstAtmId.value }, { atmId: secondAtmId.value }]);
      expect(data.snackMachines).toEqual([
        { snackMachineId: firstSnackMachineId.value },
        { snackMachineId: secondSnackMachineId.value },
      ]);
    });

    it('should write the id, expiry, balance and cash', () => {
      const data = HeadOfficeMapper.toPersistence(headOffice);

      expect(data).toMatchObject({ id: headOffice.id.value, expiresAt, balance: 12.5, cash });
    });

    it('should round-trip through HeadOfficeEntity', () => {
      const restored = HeadOfficeMapper.toDomain(
        em.create(HeadOfficeEntity, HeadOfficeMapper.toPersistence(headOffice)),
      );

      expect(restored.id).toEqual(headOffice.id);
      expect(restored.atmIds).toEqual(headOffice.atmIds);
      expect(restored.snackMachineIds).toEqual(headOffice.snackMachineIds);
      expect(restored.expiresAt).toEqual(headOffice.expiresAt);
      expect(restored.balance).toEqual(headOffice.balance);
      expect(restored.cash).toEqual(headOffice.cash);
    });
  });
});
