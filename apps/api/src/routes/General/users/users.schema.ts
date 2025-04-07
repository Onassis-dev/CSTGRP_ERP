import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const permType = z.number().min(0).max(2);

export const editSchema = z.object({
  id: z.number().optional(),
  username: z.string().optional(),
  password: z.string().min(3).optional(),
  perm_users: permType.optional(),
  perm_assistance: permType.optional(),
  perm_employees: permType.optional(),
  perm_productivity: permType.optional(),
  perm_inventory: permType.optional(),
  perm_structure: permType.optional(),
  perm_it: permType.optional(),
  perm_materialmovements: permType.optional(),
  perm_inventorystats: permType.optional(),
  perm_petitions: permType.optional(),
  perm_requisitions: permType.optional(),
  perm_poimp: permType.optional(),
  perm_resources: permType.optional(),
  perm_production: permType.optional(),
  perm_assistance_areas: z.string().max(300).optional().nullable(),
  maintance: z.boolean().optional(),
});

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
  perm_resources: permType,
  perm_production: permType,
  perm_assistance_areas: z.string().max(300).nullable(),
  maintance: z.boolean(),
});

export class RegisterDTO extends createZodDto(registerSchema) {}

export const deleteSchema = z.object({
  id: z.number(),
});
