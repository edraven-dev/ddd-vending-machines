import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@vending-machines/shared';

export class HeadOfficeDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: MoneyDto })
  readonly balance!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  readonly cash!: MoneyDto;

  constructor(id: string, balance: MoneyDto, cash: MoneyDto) {
    this.id = id;
    this.balance = balance;
    this.cash = cash;
  }
}
