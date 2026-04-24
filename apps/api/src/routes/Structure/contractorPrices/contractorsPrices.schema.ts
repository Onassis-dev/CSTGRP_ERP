import { idSchema, numberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getSchema = z.object({
  contractorId: idSchema,
});

export const createSchema = z.object({
  contractorId: idSchema,
  price: numberSchema,
  part: z.string(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
