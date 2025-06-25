import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  name: z.string(),
  ip: z.string().nullish(),
  user: z.string().nullish(),
  password: z.string().nullish(),
  wifipw: z.string().nullish(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
