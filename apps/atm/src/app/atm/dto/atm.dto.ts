import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@vending-machines/shared';

export class AtmDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: MoneyDto })
  readonly moneyInside!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  readonly moneyCharged!: MoneyDto;

  constructor(id: string, moneyInside: MoneyDto, moneyCharged: MoneyDto) {
    this.id = id;
    this.moneyInside = moneyInside;
    this.moneyCharged = moneyCharged;
  }
}
