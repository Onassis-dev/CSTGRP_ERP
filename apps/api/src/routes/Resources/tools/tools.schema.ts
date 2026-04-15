import { dateSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const generateZenpetSchema = z.object({
  date: dateSchema,
  start: intSchema,
  end: intSchema,
  product: z.string(),
  size: z.string(),
});

export const generateUlineSchema = z.object({
  start: intSchema,
  pages: intSchema,
});

export const generateUlineRoundSchema = z.object({
  year: intSchema,
  week: intSchema,
  pages: intSchema,
});

export const generateIELabelsSchema = z.object({
  client: z.string().nullish(),
  destination: z.string().nullish(),
  ps: z.string().nullish(),
  po: z.string().nullish(),
  so: z.string().nullish(),
  pallets: intSchema.nullish(),
  date: dateSchema.nullish(),
});
