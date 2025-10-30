import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchDestinationDirectionSchema = z.object({
  name: z.string().nullish(),
});

export const createDestinationDirectionSchema = z.object({
  name: z.string(),
  direction: z.string(),
});

export const editDestinationDirectionSchema =
  createDestinationDirectionSchema.extend({
    id: idSchema,
  });
