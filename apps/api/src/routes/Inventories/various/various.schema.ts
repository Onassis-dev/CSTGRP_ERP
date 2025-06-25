import { z } from 'zod/v4';

export const editSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  captured: z.boolean().optional(),
});
