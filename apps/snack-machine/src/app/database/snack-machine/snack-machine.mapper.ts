import { RequiredEntityData } from '@mikro-orm/core';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Slot } from '../../snack-machine/slot';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackPile } from '../../snack-machine/snack-pile';
import { SnackMapper } from '../snack/snack.mapper';
import SnackMachineEntity from './snack-machine.entity';

export class SnackMachineMapper {
  // oxlint-disable-next-line no-empty-function
  private constructor() {}

  static toDomain(entity: SnackMachineEntity): SnackMachine {
    const snackMachine = new SnackMachine(entity.id);
    return Object.assign(snackMachine, {
      moneyInside: new Money(
        entity.money.oneCentCount,
        entity.money.tenCentCount,
        entity.money.quarterCount,
        entity.money.oneDollarCount,
        entity.money.fiveDollarCount,
        entity.money.twentyDollarCount,
      ),
      moneyInTransaction: new Currency(entity.moneyInTransaction),
      slots: entity.slots.toArray().reduce<Slot[]>((slots, slotEntity) => {
        const snack = SnackMapper.toDomain(slotEntity.snackPile.snack);
        const slot = new Slot(snackMachine, slotEntity.position);
        Object.assign(slot, {
          id: slotEntity.id,
          snackPile: new SnackPile(snack, slotEntity.snackPile.quantity, new Currency(slotEntity.snackPile.price)),
        } satisfies Partial<Slot>);
        slots.push(slot);
        return slots;
      }, []),
    } satisfies Partial<SnackMachine>);
  }

  static toPersistence(snackMachine: SnackMachine): RequiredEntityData<SnackMachineEntity> {
    const { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount } =
      snackMachine.moneyInside;
    return {
      id: snackMachine.id,
      money: { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount },
      moneyInTransaction: snackMachine.moneyInTransaction.format({ symbol: '' }),
      slots: snackMachine.slots
        .map((slot) => ({
          id: slot.id,
          position: slot.position,
          snackPile: {
            quantity: slot.snackPile.quantity,
            price: slot.snackPile.price.format({ symbol: '' }),
            snack: slot.snackPile.snack.id,
          },
        }))
        .sort((a, b) => a.position - b.position),
    };
  }
}
