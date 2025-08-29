import { z } from 'zod/v4';
import { idSchema } from 'src/utils/schemas';

export const getOrdersSchema = z.object({
  jobpo: z.string().nullable(),
  programation: z.string().nullable(),
  clientId: idSchema.nullable(),
});

export const checkOrderSchema = z.object({
  id: idSchema,
});
