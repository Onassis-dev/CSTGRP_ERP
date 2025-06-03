import { numberSchema } from 'src/utils/schemas';
import { z } from 'zod';

export const createSchema = z.object({
  code: z.string(),
  location: z.string(),
  description: z.string(),
  measurement: z.string(),
  clientId: z.number(),
  minAmount: numberSchema,
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.number(),
});
