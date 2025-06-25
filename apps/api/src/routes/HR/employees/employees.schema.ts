import {
  numberSchema,
  noEmpleadoRegex,
  nssRegex,
  curpRegex,
  rfcRegex,
  bloodRegex,
  accountRegex,
  infonavitRegex,
  phoneRegex,
  idSchema,
  dateSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

export const getEmployeeSchema = z.object({
  id: idSchema,
});

export const getEmployeesSchema = z.object({
  active: z.string().transform((val) => val === 'true'),
});

export const createSchema = z.object({
  noEmpleado: z.string().refine((value) => noEmpleadoRegex.test(value)),
  name: z.string(),
  areaId: idSchema,
  paternalLastName: z.string(),
  maternalLastName: z.string(),
  nss: z.string().regex(nssRegex),
  curp: z.string().regex(curpRegex),
  rfc: z.string().regex(rfcRegex),
  blood: z.string().regex(bloodRegex).nullish(),
  account: z.string().regex(accountRegex).nullish(),
  emergencyContact: z.string(),
  boss: z.string().nullish(),
  department: z.string().nullish(),
  emergencyRelationship: z.string(),
  emergencyNumber: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  admissionDate: dateSchema,
  bornLocation: z.string(),
  genre: z.string().length(1),
  sons: z.number(),
  vacations: z.number().nullish(),
  clinicNo: z.string().nullish(),
  email: z.email(),
  bcpet: dateSchema,
  number: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  direction: z.string(),
  bank: z.string(),
  infonavitNo: z.string().regex(infonavitRegex).nullish(),
  infonavitFee: z.string().nullish(),
  infonavitDiscount: z.string().nullish(),
  fonacotNo: z.string().nullish(),
  positionType: z.string(),
  shift: z.string(),
  nominaSalary: numberSchema,
  immsSalary: numberSchema.nullish(),
  studies: z.string().nullish(),
  bornDate: dateSchema,
  civilStatus: z.string(),
  nationality: z.string(),
  positionId: idSchema,
  route: z.string().nullish(),
  contract: z.number(),
  quitDate: dateSchema.nullish(),
  quitStatus: z.string().nullish(),
  quitNotes: z.string().nullish(),
  quitReason: z.string().nullish(),
  resignationDate: dateSchema.nullish(),
  lastDay: dateSchema.nullish(),
  formatDate: dateSchema,
});

export const editSchema = createSchema
  .omit({ nominaSalary: true, formatDate: true })
  .extend({
    id: idSchema,
  });

export const reactivateSchema = z.object({
  id: idSchema,
  admissionDate: dateSchema,
  areaId: idSchema,
  positionId: idSchema,
  formatDate: dateSchema,
});

export const quitSchema = z.object({
  id: idSchema,
  quitDate: dateSchema,
  quitStatus: z.string(),
  quitNotes: z.string().nullish(),
  quitReason: z.string(),
  resignationDate: dateSchema.nullish(),
  lastDay: dateSchema,
  formatDate: dateSchema,
});

export const updateSalarySchema = z.object({
  newSalary: numberSchema,
  salaryReason: z.string(),
  changeDate: dateSchema,
  reasonComment: z.string().nullable(),
  petitioner: z.string(),
  comments: z.string().nullish(),
  id: idSchema,
  formatDate: dateSchema,
});

export const templateSchema = z.object({
  template: z.number(),
});
