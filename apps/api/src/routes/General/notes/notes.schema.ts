import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const editNoteSchema = createNoteSchema.extend({
  id: z.number(),
});

export const idSchema = z.object({
  id: z.string(),
});
