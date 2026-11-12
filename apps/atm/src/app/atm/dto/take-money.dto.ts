import Currency from 'currency.js';
import { z } from 'zod';

const CURRENCY_PATTERN = /^(?=.*\d)-?\$?(0|[1-9]\d*|[1-9]\d{0,2}(,\d{3})*)?(\.\d{2})?$/;

export const takeMoneySchema = z
  .object({
    amount: z
      .string()
      .regex(CURRENCY_PATTERN, 'Invalid currency')
      .meta({ examples: ['1.00'] })
      .transform((amount) => new Currency(amount)),
  })
  .meta({ id: 'TakeMoneyDto' });

export type TakeMoneyDto = z.infer<typeof takeMoneySchema>;
