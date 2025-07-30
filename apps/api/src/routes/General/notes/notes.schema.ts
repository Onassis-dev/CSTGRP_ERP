import { z } from 'zod/v4';

export const editNoteSchema = z.object({
  text: z.string().nullable(),
});
