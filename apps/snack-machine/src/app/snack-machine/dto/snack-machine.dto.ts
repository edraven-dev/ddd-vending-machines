import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@vending-machines/shared';
import { SlotDto } from './slot.dto';

export class SnackMachineDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: MoneyDto })
  readonly moneyInside!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  readonly moneyInTransaction!: MoneyDto;

  @ApiProperty({ type: SlotDto, isArray: true })
  readonly slots!: SlotDto[];

  constructor(id: string, moneyInside: MoneyDto, moneyInTransaction: MoneyDto, slots: SlotDto[]) {
    this.id = id;
    this.moneyInside = moneyInside;
    this.moneyInTransaction = moneyInTransaction;
    this.slots = slots;
  }
}
