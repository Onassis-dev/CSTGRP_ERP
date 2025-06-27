import { z } from 'zod/v4';

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
});

export const movementsFilterSchema = z.object({
  code: z.string().nullable(),
  import: z.string().nullable(),
  programation: z.string().nullable(),
  jobpo: z.string().nullable(),
  checked: z.string().nullable(),
});

export const clientSchema = z.object({
  clientId: z.string().optional().nullable(),
});
