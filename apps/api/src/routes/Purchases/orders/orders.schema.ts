import { z } from 'zod';

export const searchSchema = z.object({
  name: z.string().nullish(),
});

export const createSchema = z.object({
  issuer: z.string(),
  supplierId: z.coerce.number(),
  currency: z.string(),
  iva: z.coerce.number(),
  comments: z.string().nullable(),
  business: z.coerce.number(),
  products: z.array(
    z.object({
      id: z.coerce.number(),
      code: z.string(),
      description: z.string(),
      quantity: z.coerce.number(),
      price: z.coerce.number(),
      measurement: z.string().nullish(),
      total: z.coerce.number(),
    }),
  ),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export const deleteSchema = z.object({
  id: z.coerce.number(),
});

export const getProductsSchema = z.object({
  code: z.string().nullish(),
  supplierId: z.coerce.number().nullish(),
});
