import { z } from 'zod';

export const idSchema = z.object({
  id: z.string(),
});

export const filterSchema = z.object({
  code: z.string().nullable(),
  type: z.string().nullable(),
});

export const progressSchema = z.object({
  progressId: z.coerce.number(),
  corte: z.coerce.number().optional(),
  cortesVarios: z.coerce.number().optional(),
  produccion: z.coerce.number().optional(),
  serigrafia: z.coerce.number().optional(),
  calidad: z.coerce.number().optional(),
});
