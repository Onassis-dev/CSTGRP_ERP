import { z } from 'zod';

export const getDocSchema = z.object({
  page: z.string(),
});

const baseCreateSchema = z.object({
  doc: z.string(),
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
    id: z.number(),
  })
  .transform((data) => ({
    ...data,
    page: data.page.toLowerCase().startsWith('/')
      ? data.page.toLowerCase()
      : '/' + data.page.toLowerCase(),
  }));

export const deleteSchema = z.object({
  id: z.number(),
});
