import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const editNoteSchema = createNoteSchema.extend({
  id: idSchema,
});
