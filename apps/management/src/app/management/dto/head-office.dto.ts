import { MoneyDto } from '@vending-machines/shared';

export class HeadOfficeDto {
  readonly id!: string;
  readonly balance!: MoneyDto;
  readonly cash!: MoneyDto;

  constructor(id: string, balance: MoneyDto, cash: MoneyDto) {
    this.id = id;
    this.balance = balance;
    this.cash = cash;
  }
}
