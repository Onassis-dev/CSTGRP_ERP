import { z } from 'zod';

export const getDocumentsSchema = z.object({
  employeeId: z.string(),
});

export const editDocSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const createDocSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
});

export const idSchema = z.object({
  id: z.coerce.string().min(1),
});

export const contractSchema = z.object({
  id: z.coerce.string().min(1),
  number: z.coerce.number().min(0).max(3),
});
