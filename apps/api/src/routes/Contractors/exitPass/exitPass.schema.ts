import { dateSchema, idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getPassesSchema = z.object({
  contractorId: idSchema.nullish(),
  date: dateSchema.nullish(),
});

export const createPassSchema = z.object({
  id: idSchema.nullish(),
  contractorId: idSchema,
  date: dateSchema,
  jobs: z.array(z.object({ id: idSchema, contractorAmount: intSchema })).min(1),
});

export const editPassSchema = createPassSchema.extend({
  id: idSchema,
});
