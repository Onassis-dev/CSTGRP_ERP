import { dateSchema, idSchema, numberSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getEvaluationsSchema = z.object({
  employeeId: idSchema,
});

export const createEvaluationSchema = z.object({
  employeeId: idSchema,
  score: numberSchema,
  date: dateSchema,
});
