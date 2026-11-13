import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const createSnackMachineSchema = z.object({
  id: idSchema,
});

export type CreateSnackMachineDto = z.infer<typeof createSnackMachineSchema>;
