import { dateSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const downloadPaymentsSchema = z.object({
  deliveriesId: z.string().transform((val) => val.split(',').map(Number)),
});

export const getDeliveriesForPaymentSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
});
