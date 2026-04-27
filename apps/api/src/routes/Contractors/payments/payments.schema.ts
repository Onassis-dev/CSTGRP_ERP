import { dateSchema, idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getAllPaymentsSchema = z.object({
  date: dateSchema.nullish(),
  folio: intSchema.nullish(),
});

export const createPaymentSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  deliveriesId: z.array(idSchema),
});

export const getDeliveriesForPaymentSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
});
