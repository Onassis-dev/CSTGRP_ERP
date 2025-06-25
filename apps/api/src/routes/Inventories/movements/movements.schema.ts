import { idSchema, numberSchema, signedNumberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const movementsFilterSchema = z.object({
  code: z.string().nullable(),
  import: z.string().nullable(),
  programation: z.string().nullable(),
  jobpo: z.string().nullable(),
  checked: z.string().nullable(),
  req: z.string().nullable(),
});

export const updateAmountSchema = z.object({
  id: idSchema,
  newAmount: signedNumberSchema,
});

export const scrapSchema = z.object({
  code: z.string(),
  amount: numberSchema,
});

export const suppliesSchema = z.object({
  code: z.string(),
  amount: numberSchema,
});

export const repositionSchema = z.object({
  code: z.string(),
  amount: numberSchema,
  job: z.string(),
});

export const returnSchema = z.object({
  code: z.string(),
  amount: numberSchema,
  job: z.string().nullish(),
});
