import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const deleteAtmSchema = z.object({
  id: idSchema,
});

export type DeleteAtmDto = z.infer<typeof deleteAtmSchema>;
