import { z } from 'zod';

const numberRegex = /^-?(?:\d+|\d*\.\d{1,4})$/;

export const searchSchema = z.object({
  name: z.string().nullish(),
});

export const createSchema = z.object({
  categoryId: z.coerce.number(),
  code: z.string(),
  description: z.string(),
  price: z.string().regex(numberRegex),
  measurement: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  suppliers: z.array(z.number()),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.coerce.number(),
});
