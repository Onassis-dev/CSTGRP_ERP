import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchShipperSchema = z.object({
  name: z.string().nullish(),
});

export const createShipperSchema = z.object({
  name: z.string(),
});

export const editShipperSchema = createShipperSchema.extend({
  id: idSchema,
});
