import { dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createSchema = z.object({
  anydesk: z.string().nullish(),
  anydeskPW: z.string().nullish(),
  owner: z.string().nullish(),
  name: z.string(),
  active: z.boolean(),
  lastMaintance: dateSchema.nullish(),
  password: z.string().nullish(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
