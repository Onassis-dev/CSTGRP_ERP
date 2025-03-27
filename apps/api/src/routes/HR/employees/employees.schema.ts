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
  paternalLastName: z.string().min(3).optional().nullable(),
  maternalLastName: z.string().min(3).optional().nullable(),
  nss: z
    .string()
    .refine((value) => nssRegex.test(value))
    .optional()
    .nullable(),
  curp: z
    .string()
    .refine((value) => curpRegex.test(value))
    .optional()
    .nullable(),
  rfc: z
    .string()
    .refine((value) => rfcRegex.test(value))
    .optional()
    .nullable(),
  blood: z
    .string()
    .refine((value) => bloodRegex.test(value))
    .optional()
    .nullable(),
  account: z
    .string()
    .refine((value) => accountRegex.test(value))
    .optional()
    .nullable(),
  emergencyContact: z.string().min(1).optional().nullable(),
  emergencyNumber: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', ''))
    .optional()
    .nullable(),
  admissionDate: z.string().refine((value) => dateRegex.test(value)),
  bornLocation: z.string().min(1).optional().nullable(),
  genre: z.string().min(1).optional().nullable(),
  sons: z.number().optional().nullable(),
  vacations: z.number().optional().nullable(),
  clinicNo: z.string().min(1).optional().nullable(),
  email: z.string().email().optional().nullable(),
  number: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', ''))
    .optional()
    .nullable(),
  direction: z.string().min(1).optional().nullable(),
  bank: z.string().min(1).optional().nullable(),
  infonavitNo: z
    .string()
    .refine((value) => infonavitRegex.test(value))
    .optional()
    .nullable(),
  infonavitFee: z.string().min(1).optional().nullable(),
  infonavitDiscount: z.string().min(1).optional().nullable(),
  positionType: z.string().min(1).optional().nullable(),
  shift: z.string().min(1).optional().nullable(),
  nominaSalary: z.number().min(0).optional().nullable(),
  immsSalary: z.string().or(z.number()).optional().nullable(),
  studies: z.string().min(1).optional().nullable(),
  bornDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  civilStatus: z.string().min(1).optional().nullable(),
  nationality: z.string().min(1).optional().nullable(),
  positionId: z.number(),
  route: z.string().min(1).optional().nullable(),
  contract: z.number().min(0),
});

export const editSchema = z.object({
  id: z.number(),
  noEmpleado: z
    .string()
    .refine((value) => noEmpleadoRegex.test(value))
    .optional()
    .nullable(),
  name: z.string().min(3).optional(),
  paternalLastName: z.string().min(3).optional().nullable(),
  maternalLastName: z.string().min(3).optional().nullable(),
  nss: z
    .string()
    .refine((value) => nssRegex.test(value))
    .optional()
    .nullable(),
  curp: z
    .string()
    .refine((value) => curpRegex.test(value))
    .optional()
    .nullable(),
  rfc: z
    .string()
    .refine((value) => rfcRegex.test(value))
    .optional()
    .nullable(),
  blood: z
    .string()
    .refine((value) => bloodRegex.test(value))
    .optional()
    .nullable(),
  account: z
    .string()
    .refine((value) => accountRegex.test(value))
    .optional()
    .nullable(),
  emergencyContact: z.string().min(1).optional().nullable(),
  emergencyNumber: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', ''))
    .optional()
    .nullable(),
  admissionDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  bornLocation: z.string().min(1).optional().nullable(),
  genre: z.string().min(1).optional().nullable(),
  sons: z.number().optional().nullable(),
  vacations: z.number().optional().nullable(),
  clinicNo: z.string().min(1).optional().nullable(),
  email: z.string().email().optional().nullable(),
  number: z
    .string()
    .refine((v) => phoneRegex.test(v.replaceAll(' ', '')))
    .transform((v) => v.replaceAll(' ', ''))
    .optional()
    .nullable(),
  direction: z.string().min(1).optional().nullable(),
  bank: z.string().min(1).optional().nullable(),
  infonavitNo: z
    .string()
    .refine((value) => infonavitRegex.test(value))
    .optional()
    .nullable(),
  infonavitFee: z.string().min(1).optional().nullable(),
  infonavitDiscount: z.string().min(1).optional().nullable(),
  positionType: z.string().min(1).optional().nullable(),
  shift: z.string().min(1).optional().nullable(),
  nominaSalary: z.number().min(0).optional().nullable(),
  immsSalary: z.string().or(z.number()).optional().nullable(),
  studies: z.string().min(1).optional().nullable(),
  bornDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  civilStatus: z.string().min(1).optional().nullable(),
  nationality: z.string().min(1).optional().nullable(),
  positionId: z.number().optional().nullable(),
  areaId: z.number().optional().nullable(),
  quitDate: z
    .string()
    .refine((value) => dateRegex.test(value))
    .optional()
    .nullable(),
  quitStatus: z.string().min(1).optional().nullable(),
  quitNotes: z.string().optional().optional().nullable(),
  quitReason: z.string().min(1).optional().nullable(),
  route: z.string().min(1).optional().nullable(),
  contract: z.number().min(0).optional().nullable(),
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
});

export const idSchema = z.object({
  id: z.string().min(1),
});

export const templateSchema = z.object({
  template: z.number().min(1),
});
