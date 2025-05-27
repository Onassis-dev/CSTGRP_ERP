import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const rfcRegex =
  /^([A-ZÑ\x26]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-ZÑ|\d]{3})$/; // homoclave requerida
const curpRegex =
  /^([A-Z][AEIOUX][A-ZÑ]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HMX](AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[BCDFGHJKLMNPQRSTVWXYZÑ]{3}[A-ZÑ\d])(\d)$/;
const bloodRegex = /^(A|B|AB|O)[+-]$/;
const nssRegex = /^[0-9]{11}$/;
const infonavitRegex = /^[0-9]{10}$/;
const accountRegex = /^[0-9]{10}$/;
const noEmpleadoRegex = /^[0-9]{5}$/;
const phoneRegex = /^((\+\d{1,2}\d{10})|(\d{10}))$/;

export const createSchema = z.object({
  noEmpleado: z.string().refine((value) => noEmpleadoRegex.test(value)),
  name: z.string().min(3),
  areaId: z.number(),
  paternalLastName: z.string().min(3),
  maternalLastName: z.string().min(3),
  nss: z.string().refine((value) => nssRegex.test(value)),
  curp: z.string().refine((value) => curpRegex.test(value)),
  rfc: z.string().refine((value) => rfcRegex.test(value)),
  blood: z
    .string()
    .refine((value) => bloodRegex.test(value))
    .optional()
    .nullable(),
  account: z
    .string()
    .refine((value) => accountRegex.test(value))
    .nullish(),
  emergencyContact: z.string(),
  boss: z.string().nullish(),
  department: z.string().nullish(),
  emergencyRelationship: z.string(),
  emergencyNumber: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  admissionDate: z.string().refine((value) => dateRegex.test(value)),
  bornLocation: z.string(),
  genre: z.string().length(1),
  sons: z.number(),
  vacations: z.number().nullish(),
  clinicNo: z.string(),
  email: z.string().email(),
  bcpet: z.string().refine((value) => dateRegex.test(value)),
  number: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  direction: z.string(),
  bank: z.string(),
  infonavitNo: z
    .string()
    .refine((value) => infonavitRegex.test(value))
    .nullish(),
  infonavitFee: z.string().nullish(),
  infonavitDiscount: z.string().nullish(),
  fonacotNo: z.string().nullish(),
  positionType: z.string(),
  shift: z.string(),
  nominaSalary: z.coerce.number().min(0),
  immsSalary: z.string().or(z.number()).nullish(),
  studies: z.string().nullish(),
  bornDate: z.string().refine((value) => dateRegex.test(value)),
  civilStatus: z.string(),
  nationality: z.string(),
  positionId: z.number(),
  route: z.string().nullish(),
  contract: z.number(),
  quitDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  quitStatus: z.string().nullish(),
  quitNotes: z.string().nullish(),
  quitReason: z.string().nullish(),
  resignationDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  lastDay: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  formatDate: z.string().refine((value) => dateRegex.test(value)),
});

export const editSchema = createSchema
  .omit({ nominaSalary: true, formatDate: true })
  .extend({
    id: z.coerce.number(),
  });

export const reactivateSchema = z.object({
  id: z.number(),
  admissionDate: z.string().refine((value) => dateRegex.test(value)),
  areaId: z.number(),
  positionId: z.number(),
  formatDate: z.string().refine((value) => dateRegex.test(value)),
});

export const quitSchema = z.object({
  id: z.number(),
  quitDate: z.string().refine((value) => dateRegex.test(value)),
  quitStatus: z.string(),
  quitNotes: z.string().nullish(),
  quitReason: z.string(),
  resignationDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .nullish(),
  lastDay: z.string().refine((value) => dateRegex.test(value)),
  formatDate: z.string().refine((value) => dateRegex.test(value)),
});

export const updateSalarySchema = z.object({
  newSalary: z.coerce.number().min(0),
  salaryReason: z.string(),
  changeDate: z.string().refine((value) => dateRegex.test(value)),
  reasonComment: z.string().nullable(),
  petitioner: z.string(),
  comments: z.string().nullish(),
  id: z.number(),
  formatDate: z.string().refine((value) => dateRegex.test(value)),
});

export const idSchema = z.object({
  id: z.string(),
});

export const templateSchema = z.object({
  template: z.number(),
});
