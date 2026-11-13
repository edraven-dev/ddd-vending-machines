import { idSchema } from '@vending-machines/shared';
import { z } from 'zod';

export const deleteSnackMachineSchema = z.object({
  id: idSchema,
});

export type DeleteSnackMachineDto = z.infer<typeof deleteSnackMachineSchema>;
