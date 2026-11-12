import { z } from 'zod';

export const createSnackMachineSchema = z
  .object({
    id: z.uuidv4(),
  })
  .meta({ id: 'CreateSnackMachineDto' });

export type CreateSnackMachineDto = z.infer<typeof createSnackMachineSchema>;
