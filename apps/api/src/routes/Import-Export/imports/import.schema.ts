import { idSchema, signedNumberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
});

export const importSchema = z.object({
  ref: z.string(),
  due: z.string(),
  materials: z
    .array(
      z.object({
        code: z.string(),
        amount: signedNumberSchema,
        active: z.boolean(),
        activeDate: z.string().nullish(),
      }),
    )
    .nonempty(),
});

export const updateImportSchema = importSchema.extend({
  id: idSchema,
});
