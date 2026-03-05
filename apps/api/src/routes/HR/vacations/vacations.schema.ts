import { absoluteNumberSchema, dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createVacationSchema = z.object({
  employeeId: idSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  days: absoluteNumberSchema,
  notes: z.string().nullish(),
});
