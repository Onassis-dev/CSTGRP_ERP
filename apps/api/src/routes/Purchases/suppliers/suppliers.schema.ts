import { dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchSchema = z.object({
  name: z.string().nullish(),
});

export const createSchema = z.object({
  name: z.string(),
  document: z.string(),
  email: z.email(),
  phone: z.string(),
  direction: z.string(),
  bornDate: dateSchema,
  currency: z.string(),
  atention: z.string(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
