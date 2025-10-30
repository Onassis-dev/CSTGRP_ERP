import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchCarrierSchema = z.object({
  name: z.string().nullish(),
});

export const createCarrierSchema = z.object({
  name: z.string(),
});

export const editCarrierSchema = createCarrierSchema.extend({
  id: idSchema,
});
