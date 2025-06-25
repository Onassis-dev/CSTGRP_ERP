import { z } from 'zod/v4';

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

export const editDocSchema = z.object({
  id: z.coerce.number(),
  doc: z.any().refine((value) => typeof value === 'object', {
    message: 'El documento debe ser un objeto',
  }),
});
