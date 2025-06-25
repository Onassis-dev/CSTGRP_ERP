import { dateSchema, idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const weekSchema = z.object({
  date: dateSchema,
});

export const getSingleSchema = z.object({
  id: idSchema,
});

export const editSchema = z.object({
  id: idSchema,
  incidenceId0: intSchema,
  incidenceId1: intSchema,
  incidenceId2: intSchema,
  incidenceId3: intSchema,
  incidenceId4: intSchema,
});
