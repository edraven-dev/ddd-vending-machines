import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@vending-machines/shared';

export class HeadOfficeDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: MoneyDto })
  readonly balance!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  readonly cash!: MoneyDto;

  @ApiProperty({ type: String, format: 'uuid', isArray: true })
  readonly atmIds!: string[];

  @ApiProperty({ type: String, format: 'uuid', isArray: true })
  readonly snackMachineIds!: string[];

  constructor(id: string, balance: MoneyDto, cash: MoneyDto, atmIds: string[], snackMachineIds: string[]) {
    this.id = id;
    this.balance = balance;
    this.cash = cash;
    this.atmIds = atmIds;
    this.snackMachineIds = snackMachineIds;
  }
}
