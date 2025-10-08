import { z } from 'zod/v4';

export const getExportSchema = z.object({
  jobpo: z.string().nullable(),
});
