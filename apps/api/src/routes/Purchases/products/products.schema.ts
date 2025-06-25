import { idSchema, priceSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchSchema = z.object({
  name: z.string().nullish(),
});

export const createSchema = z.object({
  categoryId: idSchema,
  code: z.string(),
  description: z.string(),
  price: priceSchema,
  measurement: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  suppliers: z
    .array(idSchema)
    .nonempty('Debe seleccionar al menos un proveedor'),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
