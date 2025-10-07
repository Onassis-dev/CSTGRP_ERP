import {
  dateSchema,
  idSchema,
  intSchema,
  numberSchema,
  signedNumberSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

export const IEFilterSchema = z.object({
  job: z.string().nullable(),
  programation: z.string().nullable(),
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

export const exportSchema = z.object({
  programation: z.string().max(20).min(2),
  perBox: intSchema.min(1, 'Numero invalido'),
  amount: intSchema.min(1, 'Numero invalido'),
  part: z.string().nullable(),
  description: z.string().nullable(),
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
  destinations: z.array(
    z.object({
      po: z.string(),
      so: z.string(),
      amount: signedNumberSchema,
      date: dateSchema,
    }),
  ),
  operations: z.array(
    z.object({
      code: z.string(),
      minutes: numberSchema,
      area: z.string(),
    }),
  ),
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
