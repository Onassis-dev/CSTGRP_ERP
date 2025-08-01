import { idSchema, intSchema } from 'src/utils/schemas';
import { areaSchema } from '../production.utils';
import { z } from 'zod/v4';

export const getHistorySchema = z.object({
  jobpo: z.string().nullable(),
  programation: z.string().nullable(),
  clientId: idSchema.nullable(),
  completed: z.string().transform((val) => val === 'true'),
});

export const getMovementsSchema = z.object({
  id: idSchema,
});

export const updateHistorySchema = z.object({
  id: idSchema,
  amount: intSchema.min(1, 'La cantidad debe ser mayor a 0'),
  area: areaSchema,
});
