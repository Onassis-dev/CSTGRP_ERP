import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getEmployeeHistorySchema = z.object({
  employeeId: z.string(),
});

export const createRecordSchema = z.object({
  employeeId: z.string(),
  date: z.string().refine((value) => dateRegex.test(value)),
  type: z.string(),
  text: z.string(),
});

export const idSchema = z.object({
  id: z.string().min(1),
});
