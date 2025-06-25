import { z } from 'zod/v4';

export const filtersSchema = z.object({
  module: z.string().nullable(),
  text: z.string().nullable(),
  user: z.string().nullable(),
});
