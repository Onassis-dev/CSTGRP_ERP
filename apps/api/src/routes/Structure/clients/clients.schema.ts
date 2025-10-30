import { idSchema, numberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  name: z.string(),
  color: z.string(),
  active: z.boolean(),
  hourPrice: numberSchema,
  legalName: z.string(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
