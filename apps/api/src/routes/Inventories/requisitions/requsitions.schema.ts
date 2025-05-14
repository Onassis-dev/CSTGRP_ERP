import { z } from 'zod';

export const movementsFilterSchema = z.object({
  code: z.string().nullable(),
  programation: z.string().nullable(),
  jobpo: z.string().nullable(),
});

export const jobsSchema = z.object({
  code: z.string(),
});

export const requisitionSchema = z.object({
  petitioner: z.string(),
  motive: z.string(),
  areaId: z.string(),
  code: z.string(),
  requested: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
  jobIds: z.array(z.string()).transform((v) => v.map((vv) => Number(vv))),
});

export const suppliesSchema = z.object({
  petitioner: z.string(),
  motive: z.string(),
  areaId: z.string(),
  job: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val.includes(','), 'El job no puede contener comas'),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: z.string().regex(/^\d*(?:\.\d{1,2})?$/),
    }),
  ),
});
