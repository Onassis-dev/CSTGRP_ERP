import { idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

const permType = intSchema.min(0).max(2);

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
  perm_docs: permType,
  perm_purchases: permType,
  perm_prod_corte: permType,
  perm_prod_cortesVarios: permType,
  perm_prod_produccion: permType,
  perm_prod_calidad: permType,
  perm_prod_serigrafia: permType,
  perm_prodmovements: permType,
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
