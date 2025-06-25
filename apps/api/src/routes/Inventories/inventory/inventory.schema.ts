import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const editSchema = z.object({
  id: idSchema,
  name: z.string().optional(),
  captured: z.boolean().optional(),
});
