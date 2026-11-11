import { RequiredEntityData } from '@mikro-orm/core';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Atm } from '../../atm/atm';
import AtmEntity from './atm.entity';

export class AtmMapper {
  // oxlint-disable-next-line no-empty-function
  private constructor() {}

  static toDomain(entity: AtmEntity): Atm {
    const atm = new Atm(entity.id);
    atm.moneyInside = new Money(
      entity.money.oneCentCount,
      entity.money.tenCentCount,
      entity.money.quarterCount,
      entity.money.oneDollarCount,
      entity.money.fiveDollarCount,
      entity.money.twentyDollarCount,
    );
    atm.moneyCharged = new Currency(entity.moneyCharged);
    return atm;
  }

  static toPersistence(atm: Atm): RequiredEntityData<AtmEntity> {
    return {
      id: atm.id,
      money: {
        oneCentCount: atm.moneyInside.oneCentCount,
        tenCentCount: atm.moneyInside.tenCentCount,
        quarterCount: atm.moneyInside.quarterCount,
        oneDollarCount: atm.moneyInside.oneDollarCount,
        fiveDollarCount: atm.moneyInside.fiveDollarCount,
        twentyDollarCount: atm.moneyInside.twentyDollarCount,
      },
      moneyCharged: atm.moneyCharged.format({ symbol: '' }),
    };
  }
}
