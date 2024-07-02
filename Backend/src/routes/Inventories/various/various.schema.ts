import { z } from 'zod';

export const editSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  captured: z.boolean().optional(),
});
