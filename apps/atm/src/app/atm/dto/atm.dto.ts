import { MoneyDto } from '@vending-machines/shared';

export class AtmDto {
  readonly id!: string;
  readonly moneyInside!: MoneyDto;
  readonly moneyCharged!: MoneyDto;

  constructor(id: string, moneyInside: MoneyDto, moneyCharged: MoneyDto) {
    this.id = id;
    this.moneyInside = moneyInside;
    this.moneyCharged = moneyCharged;
  }
}
