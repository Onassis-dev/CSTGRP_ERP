import { z } from 'zod/v4';

export const getDataSchema = z.object({
  noEmpleado: z.string(),
  rfc: z.string(),
});
