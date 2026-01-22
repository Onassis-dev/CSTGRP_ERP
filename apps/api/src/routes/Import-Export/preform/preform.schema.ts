import {
  dateSchema,
  idSchema,
  intSchema,
  numberSchema,
  priceSchema,
} from 'src/utils/schemas';
import { z } from 'zod/v4';

export const createPreformSchema = z.object({
  noFactura: z.string(),
  date: dateSchema,
  regimen: z.string(),
  pedimento: z.string().nullish(),
  exchangeRate: priceSchema,
  comments: z.string().nullish(),

  exteriorData: z.array(
    z.object({
      name: z.string(),
      amount: numberSchema.nullable(),
    }),
  ),

  mexData: z.array(
    z.object({
      name: z.string(),
      amount: numberSchema.nullable(),
    }),
  ),

  usData: z.array(
    z.object({
      name: z.string(),
      amount: numberSchema,
    }),
  ),

  almacenData: z.array(
    z.object({
      name: z.string(),
      price: numberSchema,
      amount: intSchema,
    }),
  ),

  extraData: z.array(
    z.object({
      name: z.string(),
      amount: numberSchema.nullable(),
    }),
  ),

  clientsData: z
    .array(
      z.object({
        client: z.string(),
        entrada: z.string().nullable(),
        bultos: intSchema,
        unidad: z.string(),
        dias: intSchema,
        orden: z.string(),
      }),
    )
    .transform((obj) =>
      obj.sort((a, b) => {
        const unidadCompare = b.unidad.localeCompare(a.unidad);
        if (unidadCompare !== 0) return unidadCompare;

        const bultosCompare = b.bultos - a.bultos;
        if (bultosCompare !== 0) return bultosCompare;

        const entradaA = a.entrada ?? '';
        const entradaB = b.entrada ?? '';
        return entradaA.localeCompare(entradaB);
      }),
    ),

  unityOptions: z.array(
    z.object({
      name: z.string(),
      inOut: numberSchema,
      almacenaje: numberSchema,
    }),
  ),
});

export const editPreformSchema = createPreformSchema.extend({
  id: idSchema,
});
