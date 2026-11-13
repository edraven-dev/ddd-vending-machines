import { RequiredEntityData } from '@mikro-orm/core';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOffice } from '../../management/head-office';
import HeadOfficeEntity from './head-office.entity';

export class HeadOfficeMapper {
  // oxlint-disable-next-line no-empty-function
  private constructor() {}

  static toDomain(entity: HeadOfficeEntity): HeadOffice {
    const headOffice = new HeadOffice(Id.from(entity.id));
    headOffice.balance = new Currency(entity.balance);
    headOffice.cash = new Money(
      entity.cash.oneCentCount,
      entity.cash.tenCentCount,
      entity.cash.quarterCount,
      entity.cash.oneDollarCount,
      entity.cash.fiveDollarCount,
      entity.cash.twentyDollarCount,
    );
    return headOffice;
  }

  static toPersistence(headOffice: HeadOffice): RequiredEntityData<HeadOfficeEntity> {
    return {
      id: headOffice.id.value,
      balance: headOffice.balance.value,
      cash: {
        oneCentCount: headOffice.cash.oneCentCount,
        tenCentCount: headOffice.cash.tenCentCount,
        quarterCount: headOffice.cash.quarterCount,
        oneDollarCount: headOffice.cash.oneDollarCount,
        fiveDollarCount: headOffice.cash.fiveDollarCount,
        twentyDollarCount: headOffice.cash.twentyDollarCount,
      },
    };
  }
}
