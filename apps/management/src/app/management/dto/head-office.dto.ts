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

  @ApiProperty({ type: String, format: 'date-time' })
  readonly expiresAt!: string;

  constructor(
    id: string,
    balance: MoneyDto,
    cash: MoneyDto,
    atmIds: string[],
    snackMachineIds: string[],
    expiresAt: string,
  ) {
    this.id = id;
    this.balance = balance;
    this.cash = cash;
    this.atmIds = atmIds;
    this.snackMachineIds = snackMachineIds;
    this.expiresAt = expiresAt;
  }
}
