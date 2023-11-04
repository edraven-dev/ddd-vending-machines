import { MoneyDto } from '@vending-machines/shared';
import Currency from 'currency.js';

export class MoneyInMachineDto {
  readonly moneyInTransaction: MoneyDto;
  readonly moneyInside: MoneyDto;

  constructor(moneyInTransaction: Currency, moneyInside: Currency) {
    this.moneyInTransaction = new MoneyDto(moneyInTransaction);
    this.moneyInside = new MoneyDto(moneyInside);
  }
}
