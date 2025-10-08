import { z } from 'zod/v4';
import { idSchema, intSchema } from 'src/utils/schemas';

export const orderFilterSchema = z.object({
  jobpo: z.string().nullable(),
  programation: z.string().nullable(),
  part: z.string().nullable(),
});

export const getDestinationsSchema = z.object({
  id: idSchema,
});

export const updateDestinationPalletsSchema = z.object({
  id: idSchema,
  pallets: intSchema.min(1, 'Numero invalido'),
});
