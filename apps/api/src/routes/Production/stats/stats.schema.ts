import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dateSchema = z.object({
  date: z.string().refine((value) => dateRegex.test(value)),
});

export const areaAssistanceInfoSchema = z.object({
  date: z.string().refine((value) => dateRegex.test(value)),
  areaId: z.string(),
});
