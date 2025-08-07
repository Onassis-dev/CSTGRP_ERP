import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  name: z.string(),
  color: z.string(),
  active: z.boolean(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
