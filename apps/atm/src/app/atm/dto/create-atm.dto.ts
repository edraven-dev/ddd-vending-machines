import { z } from 'zod';

export const createAtmSchema = z
  .object({
    id: z.uuidv4(),
  })
  .meta({ id: 'CreateAtmDto' });

export type CreateAtmDto = z.infer<typeof createAtmSchema>;
