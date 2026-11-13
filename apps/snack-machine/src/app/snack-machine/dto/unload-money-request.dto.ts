import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const unloadMoneyRequestSchema = z.object({
  id: idSchema,
});

export type UnloadMoneyRequestDto = z.infer<typeof unloadMoneyRequestSchema>;
