import { numberSchema } from 'src/utils/schemas';
import { z } from 'zod';

export const idSchema = z.object({
  id: z.string(),
});

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
  type: z.string().nullable(),
  location: z.string().nullable().optional(),
});

export const importSchema = z.object({
  import: z.string(),
  due: z.string(),
  location: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: numberSchema,
    }),
  ),
});

export const exportSchema = z.object({
  programation: z.string(),
  jobpo: z.string(),
  due: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: numberSchema,
      realAmount: numberSchema,
      active: z.boolean(),
    }),
  ),
});

export const updateImportSchema = z.object({
  id: z.string(),
  due: z.string(),
  import: z.string(),
  location: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: numberSchema,
    }),
  ),
});

export const updateExportSchema = z.object({
  id: z.string(),
  due: z.string(),
  jobpo: z.string(),
  programation: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: numberSchema,
      realAmount: numberSchema,
      active: z.boolean(),
    }),
  ),
});
