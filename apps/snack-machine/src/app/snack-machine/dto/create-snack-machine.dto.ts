import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const createSnackMachineSchema = z
  .object({
    id: idSchema,
  })
  .meta({ id: 'CreateSnackMachineDto' });

export type CreateSnackMachineDto = z.infer<typeof createSnackMachineSchema>;
