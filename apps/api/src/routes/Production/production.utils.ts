import postgres from 'postgres';
import sql from 'src/utils/db';
import { z } from 'zod/v4';

export const areaSchema = z.enum(
  ['corte', 'cortesVarios', 'produccion', 'calidad', 'serigrafia'],
  'Area invalida',
);

export const updateOrderAmounts = async (id: number, sql2: postgres.Sql) => {
  const db = sql2 || sql;

  await db`update orders set 
  "corte" = COALESCE((select SUM("corte") from ordermovements where "progressId" = ${id}), 0),
  "cortesVarios" = COALESCE((select SUM("cortesVarios") from ordermovements where "progressId" = ${id}), 0),
  "produccion" = COALESCE((select SUM("produccion") from ordermovements where "progressId" = ${id}), 0),
  "calidad" = COALESCE((select SUM("calidad") from ordermovements where "progressId" = ${id}), 0),
  "serigrafia" = COALESCE((select SUM("serigrafia") from ordermovements where "progressId" = ${id}), 0)
  where id = ${id}`;
};
