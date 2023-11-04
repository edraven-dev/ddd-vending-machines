import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsDefined, isCurrency } from 'class-validator';
import Currency from 'currency.js';

export class TakeMoneyDto {
  @IsDefined()
  @Transform(({ value }) => {
    if (!isCurrency(value)) {
      throw new BadRequestException('amount must be a valid currency');
    }
    return new Currency(value);
  })
  amount: Currency;
}
