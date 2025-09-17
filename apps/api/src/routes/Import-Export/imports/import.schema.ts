import { idSchema, signedNumberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
  location: z.string().nullish(),
});

export const importSchema = z.object({
  import: z.string(),
  due: z.string(),
  location: z.string(),
  materials: z
    .array(
      z.object({
        code: z.string(),
        amount: signedNumberSchema,
      }),
    )
    .nonempty(),
});

export const updateImportSchema = importSchema.extend({
  id: idSchema,
});
