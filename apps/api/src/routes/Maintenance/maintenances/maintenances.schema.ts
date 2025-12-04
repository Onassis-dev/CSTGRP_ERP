import { dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getMaintenancesSchema = z.object({
  machineId: idSchema,
});

export const createSchema = z.object({
  machineId: idSchema,
  description: z.string(),
  date: dateSchema,
});

export const editSchema = createSchema.extend({
  id: idSchema,
});

export const deleteSchema = z.object({
  id: idSchema,
});
