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
  account: z.string().refine((value) => accountRegex.test(value)),
  emergencyContact: z.string().min(1),
  boss: z.string().min(1),
  department: z.string().min(1),
  emergencyRelationship: z.string().min(1),
  emergencyNumber: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  admissionDate: z.string().refine((value) => dateRegex.test(value)),
  bornLocation: z.string().min(1),
  genre: z.string().min(1),
  sons: z.number(),
  vacations: z.number().optional().nullable(),
  clinicNo: z.string().min(1),
  email: z.string().email(),
  number: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', '')),
  direction: z.string().min(1),
  bank: z.string().min(1),
  infonavitNo: z.string().refine((value) => infonavitRegex.test(value)),
  infonavitFee: z.string().min(1).optional().nullable(),
  infonavitDiscount: z.string().min(1).optional().nullable(),
  positionType: z.string().min(1),
  shift: z.string().min(1),
  nominaSalary: z.coerce.number().min(0),
  immsSalary: z.string().or(z.number()).optional().nullable(),
  studies: z.string().min(1).optional().nullable(),
  bornDate: z.string().refine((value) => dateRegex.test(value)),
  civilStatus: z.string().min(1),
  nationality: z.string().min(1),
  positionId: z.number(),
  route: z.string().min(1).optional().nullable(),
  contract: z.number(),
  quitDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  quitStatus: z.string().min(1).optional().nullable(),
  quitNotes: z.string().optional().nullable(),
  quitReason: z.string().min(1).optional().nullable(),
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
});

export const editSchema = createSchema.omit({ nominaSalary: true }).extend({
  id: z.coerce.number().min(1),
});

export const reactivateSchema = z.object({
  id: z.number().min(1),
  admissionDate: z.string().refine((value) => dateRegex.test(value)),
  areaId: z.number(),
  positionId: z.number(),
});

export const quitSchema = z.object({
  id: z.number().min(1),
  quitDate: z.string().refine((value) => dateRegex.test(value)),
  quitStatus: z.string().min(1),
  quitNotes: z.string().optional().nullable(),
  quitReason: z.string().min(1),
  resignationDate: z.string().refine((value) => dateRegex.test(value)),
  lastDay: z.string().refine((value) => dateRegex.test(value)),
});

export const updateSalarySchema = z.object({
  newSalary: z.coerce.number().min(0),
  salaryReason: z.string().min(1),
  changeDate: z.string().refine((value) => dateRegex.test(value)),
  reasonComment: z.string().nullable(),
  petitioner: z.string().min(1),
  comments: z.string().optional().nullable(),
  id: z.number().min(1),
});

export const idSchema = z.object({
  id: z.string().min(1),
});

export const templateSchema = z.object({
  template: z.number().min(1),
});
