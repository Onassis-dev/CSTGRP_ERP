import { idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getDeliveriesSchema = z.object({
  approved: z.string().transform((val) => val === 'true'),
  job: z.string().nullish(),
  programation: z.string().nullish(),
  contractorId: z.string().nullish(),
});

export const getHistorySchema = z.object({
  id: idSchema,
});

export const approveDeliveriesSchema = z.object({
  id: idSchema,
  rejected: intSchema,
});
