import { idSchema, intSchema } from 'src/utils/schemas';
import { areaSchema } from '../production.utils';
import { z } from 'zod/v4';

export const getProgressSchema = z.object({
  completed: z.string().transform((val) => val === 'true'),
  job: z.string().nullable(),
  programation: z.string().nullable(),
  area: areaSchema,
});

export const getHistorySchema = z.object({
  id: idSchema,
  area: areaSchema,
});

export const captureProgressSchema = z.object({
  orderId: idSchema,
  amount: intSchema.min(1, 'La cantidad debe ser mayor a 0'),
  area: areaSchema,
});
