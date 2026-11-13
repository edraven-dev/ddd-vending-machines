import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const createAtmSchema = z.object({
  id: idSchema,
});

export type CreateAtmDto = z.infer<typeof createAtmSchema>;
