import { z } from 'zod';

export const idSchema = z.object({
  id: z.string(),
});

export const IEFilterSchema = z.object({
  code: z.string().nullable(),
  type: z.string().nullable(),
});

export const importSchema = z.object({
  import: z.string(),
  due: z.string(),
  location: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
    }),
  ),
});

export const exportSchema = z.object({
  programation: z.string(),
  jobpo: z.string(),
  due: z.string(),
  part: z.string(),
  amount: z.coerce.string().regex(/^\d*(?:\.\d{1,2})?$/),
  endDate: z.string(),
  clientId: z.string(),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
      realAmount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
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
      amount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
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
      amount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
      realAmount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
      active: z.boolean(),
    }),
  ),
});
