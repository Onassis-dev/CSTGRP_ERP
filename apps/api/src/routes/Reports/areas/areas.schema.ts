import { z } from 'zod/v4';

export const getAreasSchema = z.object({
  date: z.coerce.date(),
});

export const getDayDataSchema = z.object({
  date: z.coerce.date(),
  day: z.coerce.number(),
  areaId: z.string(),
});
