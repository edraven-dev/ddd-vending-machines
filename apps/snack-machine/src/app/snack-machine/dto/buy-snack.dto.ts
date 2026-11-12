import { z } from 'zod';

export const buySnackSchema = z
  .object({
    position: z
      .int()
      .min(1)
      .max(3)
      .meta({ examples: [1] }),
  })
  .meta({ id: 'BuySnackDto' });

export type BuySnackDto = z.infer<typeof buySnackSchema>;
