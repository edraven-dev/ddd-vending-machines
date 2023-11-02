import currency from 'currency.js';
import { MoneyDto } from './money.dto';

export class MoneyInMachineDto {
  readonly moneyInTransaction: MoneyDto;
  readonly moneyInside: MoneyDto;

  constructor(moneyInTransaction: currency, moneyInside: currency) {
    this.moneyInTransaction = new MoneyDto(moneyInTransaction);
    this.moneyInside = new MoneyDto(moneyInside);
  }
}
