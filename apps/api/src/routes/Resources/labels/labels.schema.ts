import { z } from 'zod/v4';

export const readJobSchema = z.object({
  file: z.instanceof(File),
});

export const downloadLabelSchema = z.object({
  type: z.string(),
  info: z.object({
    code: z.string(),
    description: z.string(),
    date: z.string(),
    jobpo: z.string(),
    amount: z.number().nullish(),
    so: z.string().nullish(),
    po: z.string().nullish(),
  }),
});
