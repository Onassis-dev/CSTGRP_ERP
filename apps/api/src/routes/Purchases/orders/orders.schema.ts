import {
  idSchema,
  intSchema,
  numberSchema,
  priceSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

export const searchSchema = z.object({
  name: z.string().nullish(),
});

export const createSchema = z.object({
  issuer: z.string(),
  supplierId: idSchema,
  currency: z.string(),
  iva: intSchema,
  comments: z.string().nullable(),
  business: intSchema,
  products: z.array(
    z.object({
      id: idSchema,
      code: z.string(),
      description: z.string(),
      quantity: numberSchema,
      price: priceSchema,
      measurement: z.string().nullish(),
      total: priceSchema,
    }),
  ),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});

export const getProductsSchema = z.object({
  code: z.string().nullish(),
  supplierId: idSchema.nullish(),
});
