import { z } from 'zod/v4';

export const getAreasSchema = z.object({
  date: z.coerce.date(),
});
