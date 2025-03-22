import { z } from 'zod';

export const getDataSchema = z.object({
  noEmpleado: z.string(),
  rfc: z.string(),
});
