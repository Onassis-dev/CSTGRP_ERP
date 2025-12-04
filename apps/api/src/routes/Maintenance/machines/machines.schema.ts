import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getMachinesSchema = z.object({
  active: z.boolean().or(z.string().transform((val) => val === 'true')),
});

export const createSchema = z.object({
  publicId: z.string(),
  description: z.string().nullish(),
  brand: z.string().nullish(),
  model: z.string().nullish(),
  serial: z.string().nullish(),
  pediment: z.string().nullish(),
  active: z.boolean().or(z.string().transform((val) => val === 'true')),
  areaId: idSchema.nullish(),
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
