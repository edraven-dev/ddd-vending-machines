import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsUUID } from 'class-validator';
import Currency from 'currency.js';

export class MoneyDto {
  readonly amount: string;

  constructor(amount: Currency) {
    this.amount = amount.intValue < 100 ? `¢${amount.cents()}` : amount.format();
  }
}

export class UnloadMoneyDto {
  @IsInt({ each: true })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  readonly money!: [number, number, number, number, number, number];
}

export class LoadMoneyDto extends UnloadMoneyDto {
  @IsUUID('4')
  readonly id!: string;
}
