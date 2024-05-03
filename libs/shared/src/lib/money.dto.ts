import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsUUID } from 'class-validator';
import Currency from 'currency.js';
import { CoinsAndNotes } from './money';

export class MoneyDto {
  @ApiProperty({ type: String, default: '$1.00' })
  readonly amount!: string;

  constructor(amount: Currency) {
    this.amount = amount.intValue < 100 ? `¢${amount.cents()}` : amount.format({ symbol: '$' });
  }
}

export class UnloadMoneyDto {
  @IsInt({ each: true })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  readonly money!: CoinsAndNotes;
}

export class LoadMoneyDto extends UnloadMoneyDto {
  @IsUUID('4')
  readonly id!: string;
}
