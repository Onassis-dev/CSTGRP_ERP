import { z } from 'zod';

export const createSchema = z.object({
  name: z.string(),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.number(),
});
