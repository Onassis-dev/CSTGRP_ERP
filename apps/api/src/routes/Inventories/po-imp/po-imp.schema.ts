import { idSchema, intSchema, signedNumberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
  type: z.string().nullable(),
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

export const exportSchema = z.object({
  programation: intSchema,
  jobpo: z.string(),
  due: z.string(),
  materials: z
    .array(
      z.object({
        code: z.string(),
        amount: signedNumberSchema,
        realAmount: signedNumberSchema,
        active: z.boolean(),
      }),
    )
    .nonempty(),
});

export const updateExportSchema = exportSchema.extend({
  id: idSchema,
});
