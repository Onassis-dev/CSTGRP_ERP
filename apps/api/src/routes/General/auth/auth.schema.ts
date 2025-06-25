import { z } from 'zod/v4';

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
