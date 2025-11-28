import { z } from 'zod/v4';
import { idSchema, intSchema, dateSchema } from 'src/utils/schemas';

export const captureProgressSchema = z.object({
  operationId: idSchema,
  date: dateSchema,
  added: intSchema,
});

export const updateHistorySchema = captureProgressSchema.extend({
  id: idSchema,
});
