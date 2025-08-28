import { dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

const incidenceSchema = z.number().int().nullable();

export const weekSchema = z.object({
  date: dateSchema,
});

export const getSingleSchema = z.object({
  id: idSchema,
});

export const editSchema = z.object({
  id: idSchema,
  incidenceId0: incidenceSchema,
  incidenceId1: incidenceSchema,
  incidenceId2: incidenceSchema,
  incidenceId3: incidenceSchema,
  incidenceId4: incidenceSchema,
  areaId0: incidenceSchema,
  areaId1: incidenceSchema,
  areaId2: incidenceSchema,
  areaId3: incidenceSchema,
  areaId4: incidenceSchema,
  hours0: z.number().int(),
  hours1: z.number().int(),
  hours2: z.number().int(),
  hours3: z.number().int(),
  hours4: z.number().int(),
});
