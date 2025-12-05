import { z } from 'zod/v4';
import { dateSchema } from 'src/utils/schemas';

export const getHistorySchema = z.object({
  date: dateSchema,
});
