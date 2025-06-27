import {
  idSchema,
  intSchema,
  numberSchema,
  signedNumberSchema,
} from 'src/utils/schemas';
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
  amount: intSchema,
  part: z.string(),
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
  corteTime: numberSchema,
  cortesVariosTime: numberSchema,
  produccionTime: numberSchema,
  calidadTime: numberSchema,
  serigrafiaTime: numberSchema,
});

export const updateExportSchema = exportSchema.extend({
  id: idSchema,
});
