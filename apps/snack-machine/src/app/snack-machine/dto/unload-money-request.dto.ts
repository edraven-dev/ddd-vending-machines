import { z } from 'zod';

export const unloadMoneyRequestSchema = z.object({
  id: z.uuidv4(),
});

export type UnloadMoneyRequestDto = z.infer<typeof unloadMoneyRequestSchema>;
