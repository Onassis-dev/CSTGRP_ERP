import {
  dateSchema,
  idSchema,
  numberSchema,
  signedNumberSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

const absoluteNumberSchema = numberSchema.transform((v) => Math.abs(Number(v)));
const signedAbsoluteNumberSchema = signedNumberSchema.transform((v) =>
  Math.abs(Number(v)),
);

export const movementsFilterSchema = z.object({
  code: z.string().nullable(),
  import: z.string().nullable(),
  programation: z.string().nullable(),
  jobpo: z.string().nullable(),
  checked: z.string().nullable(),
  req: z.string().nullable(),
  type: z.string().nullable(),
});

export const updateAmountSchema = z.object({
  id: idSchema,
  newAmount: signedAbsoluteNumberSchema,
});

export const scrapSchema = z.object({
  code: z.string(),
  amount: absoluteNumberSchema,
});

export const suppliesSchema = z.object({
  code: z.string(),
  amount: absoluteNumberSchema,
});

export const repositionSchema = z.object({
  code: z.string(),
  amount: absoluteNumberSchema,
  job: z.string(),
});

export const returnSchema = z.object({
  code: z.string(),
  amount: absoluteNumberSchema,
});

export const leftoverSchema = z.object({
  code: z.string(),
  amount: absoluteNumberSchema,
  job: z.string(),
});

export const adjustmentSchema = z.object({
  code: z.string(),
  amount: signedNumberSchema,
});

export const updateMovementDateSchema = z.object({
  id: idSchema,
  date: dateSchema,
});
