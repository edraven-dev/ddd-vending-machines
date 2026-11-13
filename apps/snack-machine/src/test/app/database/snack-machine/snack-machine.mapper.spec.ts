import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { MikroORM } from '@mikro-orm/postgresql';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import SlotEntity from '../../../../app/database/snack-machine/slot.entity';
import SnackMachineEntity from '../../../../app/database/snack-machine/snack-machine.entity';
import { SnackMachineMapper } from '../../../../app/database/snack-machine/snack-machine.mapper';
import SnackEntity from '../../../../app/database/snack/snack.entity';
import { SnackMachine } from '../../../../app/snack-machine/snack-machine';
import { SnackPile } from '../../../../app/snack-machine/snack-pile';
import { Snack } from '../../../../app/snack/snack';

describe('SnackMachineMapper', () => {
  const orm = new MikroORM({
    dbName: 'unused',
    metadataProvider: ReflectMetadataProvider,
    entities: [SnackMachineEntity, SlotEntity, SnackEntity],
  });
  const em = orm.em.fork();
  const anEntity = (slots: { position: number; snack: string | null; quantity: number }[]) =>
    em.create(SnackMachineEntity, {
      id: Id.generate().value,
      money: {
        oneCentCount: 1,
        tenCentCount: 0,
        quarterCount: 0,
        oneDollarCount: 2,
        fiveDollarCount: 0,
        twentyDollarCount: 0,
      },
      moneyInTransaction: '1.00',
      slots: slots.map(({ position, snack, quantity }) => ({
        id: Id.generate().value,
        position,
        snackPile: { quantity, price: snack === null ? '0.00' : '2.50', snack },
      })),
    });
  const entity = anEntity([
    { position: 3, snack: null, quantity: 0 },
    { position: 1, snack: Snack.Chocolate.id.value, quantity: 3 },
    { position: 2, snack: Snack.Soda.id.value, quantity: 0 },
  ]);

  describe('#toDomain', () => {
    it('should restore the machine state', () => {
      const snackMachine = SnackMachineMapper.toDomain(entity);

      expect(snackMachine.id).toEqual(Id.from(entity.id));
      expect(snackMachine.moneyInside).toEqual(new Money(1, 0, 0, 2, 0, 0));
      expect(snackMachine.moneyInTransaction).toEqual(new Currency('1.00'));
    });

    it('should keep the persisted slot ids, ordered by position', () => {
      const snackMachine = SnackMachineMapper.toDomain(entity);
      const slotIds = [1, 2, 3].map((position) => entity.slots.find((slot) => slot.position === position)?.id);

      expect(snackMachine.slots.map((slot) => slot.id.value)).toEqual(slotIds);
    });

    it('should resolve snacks from the catalog', () => {
      const snackMachine = SnackMachineMapper.toDomain(entity);

      expect(snackMachine.getSnackPile(1)).toEqual(new SnackPile(Snack.Chocolate, 3, new Currency('2.50')));
      expect(snackMachine.getSnackPile(1).snack).toBe(Snack.Chocolate);
      expect(snackMachine.getSnackPile(2).snack).toBe(Snack.Soda);
    });

    it('should map a slot without a snack to the empty pile', () => {
      const snackMachine = SnackMachineMapper.toDomain(entity);

      expect(snackMachine.getSnackPile(3)).toBe(SnackPile.Empty);
    });

    it('should throw on an unknown snack', () => {
      const unknownSnackId = Id.generate().value;
      const withUnknownSnack = anEntity([
        { position: 1, snack: unknownSnackId, quantity: 1 },
        { position: 2, snack: null, quantity: 0 },
        { position: 3, snack: null, quantity: 0 },
      ]);

      expect(() => SnackMachineMapper.toDomain(withUnknownSnack)).toThrow(`Unknown snack ${unknownSnackId}`);
    });
  });

  describe('#toPersistence', () => {
    const snackMachine = new SnackMachine(Id.generate());
    snackMachine.loadSnacks(1, new SnackPile(Snack.Gum, 1, new Currency('1.00')));

    it('should write ids as strings', () => {
      const data = SnackMachineMapper.toPersistence(snackMachine);

      expect(data.id).toBe(snackMachine.id.value);
      expect(data.slots.map((slot) => slot.id)).toEqual(snackMachine.slots.map((slot) => slot.id.value));
    });

    it('should write the snack id of a loaded pile and no snack for an empty one', () => {
      const data = SnackMachineMapper.toPersistence(snackMachine);

      expect(data.slots.map((slot) => slot.snackPile)).toEqual([
        { quantity: 1, price: '1.00', snack: Snack.Gum.id.value },
        { quantity: 0, price: '0.00', snack: null },
        { quantity: 0, price: '0.00', snack: null },
      ]);
    });

    it('should round-trip through SnackMachineEntity', () => {
      const restored = SnackMachineMapper.toDomain(
        em.create(SnackMachineEntity, SnackMachineMapper.toPersistence(snackMachine)),
      );

      expect(restored.id).toEqual(snackMachine.id);
      expect(restored.slots.map(({ id, position, snackPile }) => ({ id, position, snackPile }))).toEqual(
        snackMachine.slots.map(({ id, position, snackPile }) => ({ id, position, snackPile })),
      );
    });
  });
});
