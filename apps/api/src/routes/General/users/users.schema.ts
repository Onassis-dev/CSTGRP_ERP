import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const permType = z.number().min(0).max(2);

export const registerSchema = z.object({
  username: z.string(),
  password: z.string().min(3),
  perm_users: permType,
  perm_assistance: permType,
  perm_employees: permType,
  perm_productivity: permType,
  perm_inventory: permType,
  perm_it: permType,
  perm_structure: permType,
  perm_materialmovements: permType,
  perm_inventorystats: permType,
  perm_requisitions: permType,
  perm_petitions: permType,
  perm_poimp: permType,
  perm_formats: permType,
  perm_directory: permType,
  perm_purchases: permType,
  perm_assistance_areas: z.string().max(300).nullable(),
  maintance: z.boolean(),
});

export const editSchema = registerSchema.extend({
  id: z.number(),
  password: z.string().min(3).optional(),
});

export class RegisterDTO extends createZodDto(registerSchema) {}

export const deleteSchema = z.object({
  id: z.number(),
});
