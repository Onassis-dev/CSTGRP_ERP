import { dateSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const generateZenpetSchema = z.object({
  date: dateSchema,
  start: intSchema,
  end: intSchema,
  product: z.string(),
  size: z.string(),
});
