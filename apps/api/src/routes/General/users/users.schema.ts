import { idSchema, intSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';

const permType = intSchema.min(0).max(3);

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
  reports_orders: permType,
  reports_areas: permType,
  hr_dashboard: permType,
  imports: permType,
  jobs: permType,
};

export const registerSchema = z.object({
  username: z.string(),
  password: z.string().min(3),
  permissions: z.object(permissionsList),
  maintance: z.boolean(),
  assistance_areas: z.array(z.coerce.number().int()),
  prod_areas: z.array(z.coerce.number().int()),
  clientId: idSchema.nullable(),
});

export const editSchema = registerSchema.extend({
  id: idSchema,
  password: z.string().min(6).optional(),
});

export const deleteSchema = z.object({
  id: idSchema,
});
