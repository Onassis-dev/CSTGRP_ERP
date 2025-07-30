import { z } from 'zod/v4';
import { idSchema } from 'src/utils/schemas';

export const getOrdersSchema = z.object({});

export const checkOrderSchema = z.object({
  id: idSchema,
});
