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
  programation: z.string().max(20).min(2),
  amount: intSchema,
  part: z.string().nullish(),
  jobpo: z.string(),
  due: z.string(),
  areaId: idSchema,
  clientId: idSchema,
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
  productId: idSchema.nullish(),
});

export const updateExportSchema = exportSchema
  .extend({
    id: idSchema,
  })
  .omit({
    productId: true,
  });
