import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const createAtmSchema = z
  .object({
    id: idSchema,
  })
  .meta({ id: 'CreateAtmDto' });

export type CreateAtmDto = z.infer<typeof createAtmSchema>;
