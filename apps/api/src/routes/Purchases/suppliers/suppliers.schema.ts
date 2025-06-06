import { z } from 'zod';
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createSchema = z.object({
  name: z.string(),
  document: z.string(),
  email: z.string().email(),
  phone: z.string(),
  direction: z.string(),
  bornDate: z.string().refine((value) => dateRegex.test(value)),
  currency: z.string(),
  atention: z.string(),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.number(),
});
