import { RequiredEntityData } from '@mikro-orm/core';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackPile } from '../../snack-machine/snack-pile';
import { Snack } from '../../snack/snack';
import { SnackMapper } from '../snack/snack.mapper';
import type { SnackPileEmbeddable } from './slot.entity';
import SnackMachineEntity from './snack-machine.entity';

export class SnackMachineMapper {
  // oxlint-disable-next-line no-empty-function
  private constructor() {}

  static toDomain(entity: SnackMachineEntity): SnackMachine {
    return SnackMachine.restore(
      Id.from(entity.id),
      entity.slots.map((slot) => ({
        id: Id.from(slot.id),
        position: slot.position,
        snackPile: SnackMachineMapper.toSnackPile(slot.snackPile),
      })),
      new Money(
        entity.money.oneCentCount,
        entity.money.tenCentCount,
        entity.money.quarterCount,
        entity.money.oneDollarCount,
        entity.money.fiveDollarCount,
        entity.money.twentyDollarCount,
      ),
      new Currency(entity.moneyInTransaction),
    );
  }

  static toPersistence(snackMachine: SnackMachine) {
    const { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount } =
      snackMachine.moneyInside;
    return {
      id: snackMachine.id.value,
      money: { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount },
      moneyInTransaction: snackMachine.moneyInTransaction.format({ symbol: '' }),
      slots: snackMachine.slots.map((slot) => ({
        id: slot.id.value,
        position: slot.position,
        snackPile: {
          quantity: slot.snackPile.quantity,
          price: slot.snackPile.price.format({ symbol: '' }),
          snack: slot.snackPile.snack.equals(Snack.None) ? null : slot.snackPile.snack.id.value,
        },
      })),
    } satisfies RequiredEntityData<SnackMachineEntity>;
  }

  private static toSnackPile({ snack, quantity, price }: SnackPileEmbeddable): SnackPile {
    return snack === null ? SnackPile.Empty : new SnackPile(SnackMapper.toDomain(snack), quantity, new Currency(price));
  }
}
