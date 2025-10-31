import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchShipToSchema = z.object({
  name: z.string().nullish(),
});

export const createShipToSchema = z.object({
  name: z.string(),
  direction: z.string(),
});

export const editShipToSchema =
  createShipToSchema.extend({
    id: idSchema,
  });

