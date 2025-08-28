import { z } from 'zod/v4';

export const filterSchema = z.object({
  folio: z.string().nullish(),
  code: z
    .string()
    .nullish()
    .transform((e) => e?.toUpperCase().trim()),
});
