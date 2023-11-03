import { EntityData } from '@mikro-orm/core';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Slot } from '../../snack-machine/slot';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackPile } from '../../snack-machine/snack-pile';
import { SnackMapper } from '../snack/snack.mapper';
import SnackMachineEntity from './snack-machine.entity';

export class SnackMachineMapper {
  private constructor() {}

  static toDomain(entity: SnackMachineEntity): SnackMachine {
    const snackMachine = new SnackMachine();
    return Object.assign(snackMachine, {
      id: entity.id,
      moneyInside: new Money(
        entity.money.oneCentCount,
        entity.money.tenCentCount,
        entity.money.quarterCount,
        entity.money.oneDollarCount,
        entity.money.fiveDollarCount,
        entity.money.twentyDollarCount,
      ),
      moneyInTransaction: new Currency(0),
      slots: entity.slots.toArray().reduce((slots, slotEntity) => {
        const snack = SnackMapper.toDomain(slotEntity.snackPile.snack);
        const slot = new Slot(snackMachine, slotEntity.position);
        Object.assign(slot, {
          id: slotEntity.id,
          snackPile: new SnackPile(snack, slotEntity.snackPile.quantity, new Currency(slotEntity.snackPile.price)),
        });
        slots.push(slot);
        return slots;
      }, []),
    });
  }

  static toPersistence(snackMachine: SnackMachine): EntityData<SnackMachineEntity> {
    return {
      money: { ...snackMachine.moneyInside },
      slots: snackMachine.slots
        .map((slot) => ({
          id: slot.id,
          position: slot.position,
          snackPile: {
            quantity: slot.snackPile.quantity,
          },
        }))
        .sort((a, b) => a.position - b.position),
    };
  }
}
