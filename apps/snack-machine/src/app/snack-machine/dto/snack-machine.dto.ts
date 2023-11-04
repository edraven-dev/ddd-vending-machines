import { MoneyDto } from '@vending-machines/shared';
import { SlotDto } from './slot.dto';

export class SnackMachineDto {
  readonly id!: string;
  readonly moneyInside!: MoneyDto;
  readonly moneyInTransaction!: MoneyDto;
  readonly slots!: SlotDto[];

  constructor(id: string, moneyInside: MoneyDto, moneyInTransaction: MoneyDto, slots: SlotDto[]) {
    this.id = id;
    this.moneyInside = moneyInside;
    this.moneyInTransaction = moneyInTransaction;
    this.slots = slots;
  }
}
