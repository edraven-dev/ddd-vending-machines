import { RequiredEntityData } from '@mikro-orm/core';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOffice } from '../../management/head-office';
import HeadOfficeEntity from './head-office.entity';

export class HeadOfficeMapper {
  private constructor() {}

  static toDomain(entity: HeadOfficeEntity): HeadOffice {
    const headOffice = new HeadOffice();
    return Object.assign(headOffice, {
      id: entity.id,
      balance: new Currency(entity.balance),
      cash: new Money(
        entity.cash.oneCentCount,
        entity.cash.tenCentCount,
        entity.cash.quarterCount,
        entity.cash.oneDollarCount,
        entity.cash.fiveDollarCount,
        entity.cash.twentyDollarCount,
      ),
    });
  }

  static toPersistence(headOffice: HeadOffice): RequiredEntityData<HeadOfficeEntity> {
    return {
      id: headOffice.id,
      balance: headOffice.balance.value,
      cash: { ...headOffice.cash },
    };
  }
}
