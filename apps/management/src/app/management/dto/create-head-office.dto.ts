import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const createHeadOfficeSchema = z
  .object({
    id: idSchema,
  })
  .meta({ id: 'CreateHeadOfficeDto' });

export type CreateHeadOfficeDto = z.infer<typeof createHeadOfficeSchema>;
