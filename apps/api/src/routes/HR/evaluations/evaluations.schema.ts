import { numberSchema } from 'src/utils/schemas';
import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getEvaluationsSchema = z.object({
  employeeId: z.string(),
});

export const createEvaluationSchema = z.object({
  employeeId: z.string(),
  score: numberSchema,
  date: z.string().refine((value) => dateRegex.test(value)),
});

export const idSchema = z.object({
  id: z.string().min(1),
});
