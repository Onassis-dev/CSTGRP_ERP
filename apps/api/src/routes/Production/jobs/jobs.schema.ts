import {
  dateSchema,
  idSchema,
  intSchema,
  numberSchema,
  signedNumberSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

const transactionOptions = z.enum(['delete', 'insert']);

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
  jobs: z.array(z.string()).nonempty('Al menos un job es requerido.'),
  due: z.string(),
  areaId: idSchema,
  clientId: idSchema,
  materials: z
    .array(
      z.object({
        id: z.coerce.number().nullish(),
        transaction: transactionOptions.nullish(),
        code: z.string(),
        amount: signedNumberSchema,
        realAmount: signedNumberSchema,
        active: z.boolean(),
      }),
    )
    .nonempty(),
  destinations: z.array(
    z.object({
      id: z.coerce.number().nullish(),
      transaction: transactionOptions.nullish(),
      po: z.string().nullable(),
      so: z.string(),
      amount: intSchema.min(1),
      date: dateSchema,
    }),
  ),
  operations: z.array(
    z.object({
      id: z.coerce.number().nullish(),
      transaction: transactionOptions.nullish(),
      code: z.string(),
      minutes: numberSchema,
      area: z.string(),
    }),
  ),
  bastones: z.array(z.string()).max(2),
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
    ref: z.string(),
  })
  .omit({
    productId: true,
    jobs: true,
  });
