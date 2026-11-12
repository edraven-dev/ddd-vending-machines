import { ApiProperty } from '@nestjs/swagger';
import Currency from 'currency.js';
import { z } from 'zod';

export class MoneyDto {
  @ApiProperty({ type: String, default: '$1.00' })
  readonly amount!: string;

  constructor(amount: Currency) {
    this.amount = amount.intValue < 100 ? `¢${amount.cents()}` : amount.format({ symbol: '$' });
  }
}

export const unloadMoneySchema = z.object({
  money: z.tuple([z.int(), z.int(), z.int(), z.int(), z.int(), z.int()]),
});

export type UnloadMoneyDto = z.infer<typeof unloadMoneySchema>;

export const loadMoneySchema = unloadMoneySchema.extend({
  id: z.uuidv4(),
});

export type LoadMoneyDto = z.infer<typeof loadMoneySchema>;
