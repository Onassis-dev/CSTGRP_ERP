import { idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

const permType = intSchema.min(0).max(2);

export const permissionsList = {
  users: permType,
  assistance: permType,
  employees: permType,
  productivity: permType,
  inventory: permType,
  it: permType,
  structure: permType,
  materialmovements: permType,
  inventorystats: permType,
  requisitions: permType,
  petitions: permType,
  poimp: permType,
  formats: permType,
  directory: permType,
  docs: permType,
  purchases: permType,
  prod_corte: permType,
  prod_cortesVarios: permType,
  prod_produccion: permType,
  prod_calidad: permType,
  prod_serigrafia: permType,
  prodmovements: permType,
  reports: permType,
};

export const registerSchema = z.object({
  username: z.string(),
  password: z.string().min(3),
  permissions: z.object(permissionsList),
  perm_assistance_areas: z.string().max(300).nullable(),
  maintance: z.boolean(),
});

export const editSchema = registerSchema.extend({
  id: idSchema,
  password: z.string().min(6).optional(),
});

export const deleteSchema = z.object({
  id: idSchema,
});
