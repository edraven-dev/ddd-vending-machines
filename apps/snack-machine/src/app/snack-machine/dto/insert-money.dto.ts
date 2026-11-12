import { z } from 'zod';

const pieceCount = z.int().min(0).max(1);

export const insertMoneySchema = z
  .object({
    money: z
      .tuple([pieceCount, pieceCount, pieceCount, pieceCount, pieceCount, pieceCount])
      .meta({ examples: [[0, 0, 0, 0, 0, 1]] }),
  })
  .meta({ id: 'InsertMoneyDto' });

export type InsertMoneyDto = z.infer<typeof insertMoneySchema>;
