import { z } from 'zod';

export const loadSnacksSchema = z
  .object({
    position: z
      .int()
      .min(1)
      .max(3)
      .meta({ examples: [1] }),
    quantity: z
      .int()
      .min(1)
      .max(20)
      .meta({ examples: [10] }),
  })
  .meta({ id: 'LoadSnacksDto' });

export type LoadSnacksDto = z.infer<typeof loadSnacksSchema>;
