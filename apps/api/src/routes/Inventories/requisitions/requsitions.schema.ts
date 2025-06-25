import { idSchema, intSchema, numberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const movementsFilterSchema = z.object({
  code: z.string().nullable(),
  programation: intSchema,
  jobpo: z.string().nullable(),
});

export const jobsSchema = z.object({
  code: z.string(),
});

export const requisitionSchema = z.object({
  petitioner: z.string(),
  motive: z.string(),
  areaId: idSchema,
  code: z.string(),
  requested: numberSchema,
  jobIds: z.array(z.string()).transform((v) => v.map((vv) => Number(vv))),
});

export const suppliesSchema = z.object({
  petitioner: z.string(),
  motive: z.string(),
  areaId: idSchema,
  job: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val?.includes(','), 'El job no puede contener comas'),
  materials: z.array(
    z.object({
      code: z.string(),
      amount: numberSchema,
    }),
  ),
});
