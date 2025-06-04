import { z } from 'zod';

export const editSchema = z.object({
  id: z.number().optional(),
  extension: z.string().optional().nullable(),
  emailId: z.number().optional().nullable(),
  employeeId: z.number().optional().nullable(),
});

export const createSchema = z.object({
  extension: z.string().optional().nullable(),
  emailId: z.number(),
  employeeId: z.number(),
});

export const deleteSchema = z.object({
  id: z.number(),
});
