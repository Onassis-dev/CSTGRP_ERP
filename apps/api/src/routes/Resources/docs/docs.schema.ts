import { idSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getDocSchema = z.object({
  page: z.string(),
});

const baseCreateSchema = z.object({
  doc: z.url(),
  page: z.string(),
});

export const createSchema = baseCreateSchema.transform((data) => ({
  ...data,
  page: data.page.toLowerCase().startsWith('/')
    ? data.page.toLowerCase()
    : '/' + data.page.toLowerCase(),
}));

export const editSchema = baseCreateSchema
  .extend({
    id: idSchema,
  })
  .transform((data) => ({
    ...data,
    page: data.page.toLowerCase().startsWith('/')
      ? data.page.toLowerCase()
      : '/' + data.page.toLowerCase(),
  }));

export const deleteSchema = z.object({
  id: idSchema,
});
