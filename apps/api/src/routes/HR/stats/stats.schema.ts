import { dateSchema, idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const dateObjectSchema = z.object({
  date: dateSchema,
});

export const areaAssistanceInfoSchema = z.object({
  date: dateSchema,
  areaId: idSchema.nullable(),
});
