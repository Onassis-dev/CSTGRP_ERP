import { idSchema, numberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  code: z.string(),
  location: z.string(),
  description: z.string(),
  measurement: z.string(),
  clientId: z.number(),
  minAmount: numberSchema,
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
