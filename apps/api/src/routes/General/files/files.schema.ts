import { z } from 'zod/v4';

export const fileSchema = z.object({
  file: z.string(),
});
