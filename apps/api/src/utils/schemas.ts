import * as z from 'zod/v4';

export const rfcRegex =
  /^([A-ZÑ\x26]{4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-ZÑ|\d]{3})$/; // homoclave requerida
export const curpRegex =
  /^([A-Z][AEIOUX][A-ZÑ]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HMX](AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[BCDFGHJKLMNPQRSTVWXYZÑ]{3}[A-ZÑ\d])(\d)$/;
export const nssRegex = /^[0-9]{11}$/;
export const infonavitRegex = /^[0-9]{10}$/;
export const accountRegex = /^[0-9]{10}$/;
export const noEmpleadoRegex = /^[0-9]{5}$/;
export const phoneRegex = /^((\+\d{1,2}\d{10})|(\d{10}))$/;

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const dateSchema = z.coerce.string().regex(dateRegex, 'Fecha invalida');

export const signedNumberRegex = /^-?(?:\d+|\d*\.\d{1,2})$/;
export const numberRegex = /^(?:\d+|\d*\.\d{1,2})$/;
export const priceRegex = /^-?(?:\d+|\d*\.\d{1,4})$/;
export const numberSchema = z.coerce
  .string()
  .regex(numberRegex, 'Numero invalido');
export const priceSchema = z.coerce
  .string()
  .regex(priceRegex, 'Numero invalido');
export const intSchema = z.coerce
  .number('Numero invalido')
  .int('No acepta decimales');
export const signedNumberSchema = z.coerce
  .string()
  .regex(signedNumberRegex, 'Numero invalido');

export const idSchema = z.coerce
  .number('Opcion invalida')
  .int('Opcion invalida')
  .positive('Opcion invalida');
export const idObjectSchema = z.object({
  id: idSchema,
});

// Extra
export const absoluteNumberSchema = numberSchema.transform((v) =>
  Math.abs(Number(v)),
);
export const signedAbsoluteNumberSchema = signedNumberSchema.transform((v) =>
  Math.abs(Number(v)),
);
