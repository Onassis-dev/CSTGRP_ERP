import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  name: z.string(),
  position: z.string(),
  extension: z.string().nullish(),
  emailId: idSchema,
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
