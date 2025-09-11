import { HttpException } from '@nestjs/common';
import postgres from 'postgres';
import { updateMaterialAmount } from 'src/utils/functions';
import { z } from 'zod/v4';

export const areaSchema = z.enum(
  ['corte', 'cortesVarios', 'produccion', 'calidad', 'serigrafia'],
  'Area invalida',
);

export const updateOrderAmounts = async (id: number, sql2: postgres.Sql) => {
  const db = sql2;

  const [row] = await db`UPDATE orders SET 
  "corte" = COALESCE((SELECT SUM("corte") FROM ordermovements WHERE "progressId" = ${id}), 0),
  "cortesVarios" = COALESCE((SELECT SUM("cortesVarios") FROM ordermovements WHERE "progressId" = ${id}), 0),
  "produccion" = COALESCE((SELECT SUM("produccion") FROM ordermovements WHERE "progressId" = ${id}), 0),
  "calidad" = COALESCE((SELECT SUM("calidad") FROM ordermovements WHERE "progressId" = ${id}), 0),
  "serigrafia" = COALESCE((SELECT SUM("serigrafia") FROM ordermovements WHERE "progressId" = ${id}), 0),

  "completed" = (
      ((COALESCE("produccionTime", 0) > 0 AND "produccion" = "amount") OR COALESCE("produccionTime", 0) = 0) AND
      ((COALESCE("serigrafiaTime", 0) > 0 AND "serigrafia" = "amount") OR COALESCE("serigrafiaTime", 0) = 0) AND
      ((COALESCE("corteTime", 0) > 0 AND "corte" = "amount") OR COALESCE("corteTime", 0) = 0) AND
      ((COALESCE("cortesVariosTime", 0) > 0 AND "cortesVarios" = "amount") OR COALESCE("cortesVariosTime", 0) = 0) AND
      ((COALESCE("calidadTime", 0) > 0 AND "calidad" = "amount") OR COALESCE("calidadTime", 0) = 0)
    )

WHERE id = ${id} returning *`;

  if (!checkAreasAmounts(row as any)) {
    throw new HttpException(
      'La cantidad es mayor a la producida por anteriores partes del proceso',
      400,
    );
  }

  const [updatedMovement] = await db`update materialmovements set 
    "amount" = (select calidad from orders where id = ${id}),
    "realAmount" = (select calidad from orders where id = ${id})
    where id = (select "movementId" from orders where id = ${id}) returning "materialId"`;

  if (updatedMovement)
    await updateMaterialAmount(updatedMovement.materialId, db);
};

function checkAreasAmounts({
  corteTime,
  cortesVariosTime,
  serigrafiaTime,
  produccionTime,
  calidadTime,
  corte,
  cortesVarios,
  serigrafia,
  produccion,
  calidad,
}): boolean {
  if (Number(serigrafiaTime) > 0) {
    if (Number(corteTime) > 0 && serigrafia > corte) return false;
  }

  if (Number(produccionTime) > 0) {
    if (Number(serigrafiaTime) > 0 && produccion > serigrafia) return false;
    if (Number(cortesVariosTime) > 0 && produccion > cortesVarios) return false;
  }

  if (Number(calidadTime) > 0) {
    if (Number(produccionTime) > 0 && calidad > produccion) return false;
  }

  return true;
}
