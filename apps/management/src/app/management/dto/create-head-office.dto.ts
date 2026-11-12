import { z } from 'zod';

export const createHeadOfficeSchema = z
  .object({
    id: z.uuidv4(),
  })
  .meta({ id: 'CreateHeadOfficeDto' });

export type CreateHeadOfficeDto = z.infer<typeof createHeadOfficeSchema>;
