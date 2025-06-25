import { idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getDocumentsSchema = z.object({
  employeeId: z.string(),
});

export const editDocSchema = z.object({
  id: idSchema,
  name: z.string(),
});

export const createDocSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
});

export const contractSchema = z.object({
  id: idSchema,
  number: intSchema.min(0).max(3),
});
