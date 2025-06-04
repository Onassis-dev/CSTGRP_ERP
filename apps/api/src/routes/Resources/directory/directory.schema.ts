import { z } from 'zod';

export const createSchema = z.object({
  name: z.string(),
  position: z.string(),
  extension: z.string().nullish(),
  emailId: z.number(),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.number(),
});
