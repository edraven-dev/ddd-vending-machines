import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, isCurrency } from 'class-validator';
import Currency from 'currency.js';

export class TakeMoneyDto {
  @ApiProperty({ type: String, example: '1.00' })
  @IsDefined()
  @Transform(({ value }) => {
    if (!isCurrency(value)) {
      throw new BadRequestException('amount must be a valid currency');
    }
    return new Currency(value);
  })
  amount: Currency;
}
