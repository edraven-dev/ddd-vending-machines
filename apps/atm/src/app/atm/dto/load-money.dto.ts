import { idSchema, unloadMoneySchema } from '@vending-machines/shared';
import type { z } from 'zod';

export const loadMoneySchema = unloadMoneySchema.extend({
  id: idSchema,
});

export type LoadMoneyDto = z.infer<typeof loadMoneySchema>;
