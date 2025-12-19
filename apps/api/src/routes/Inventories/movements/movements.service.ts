import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import {
  leftoverSchema,
  movementsFilterSchema,
  repositionSchema,
  returnSchema,
  scrapSchema,
  suppliesSchema,
  updateAmountSchema,
} from './movements.schema';
import { updateMaterialAmount } from 'src/utils/functions';
import exceljs from 'exceljs';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class MovementsService {
  constructor(private readonly req: ContextProvider) {}

  async getMovements(body: z.infer<typeof movementsFilterSchema>) {
    const movements = await sql`SELECT
        materials.code, materials.description, materials.measurement, materials."clientId", materials."leftoverAmount", materials.amount as inventory,
        materialmovements.active, materialmovements.amount, materialmovements."realAmount", materialmovements.id, materialmovements.extra,
        jobs.programation,
        COALESCE(
          jobs.ref, 
          imports.ref, 
          CASE materialmovements.type
            WHEN 'return' THEN 'RETORNO'
            WHEN 'scrap' THEN 'SCRAP'
            WHEN 'consumable' THEN 'INSUMO'
            ELSE ''
          END
        ) as ref,
        (select STRING_AGG(folio::TEXT, ', ')  from requisitions where jobs.ref is not null AND jobs LIKE CONCAT('%', jobs.ref, ',%') and requisitions."materialId" = materials.id) as req

      FROM materialmovements
      JOIN materials on materials.id = materialmovements."materialId"
      LEFT JOIN jobs on jobs.id = materialmovements."jobId"
      LEFT JOIN imports on imports.id = materialmovements."importId"
      
      WHERE
      ${body.jobpo ? sql`jobs.ref = ${body.jobpo}` : sql`TRUE`} AND
      ${body.import ? sql`imports.ref = ${body.import}` : sql`TRUE`} AND
      ${body.programation ? sql`jobs.programation = ${body.programation}` : sql`TRUE`} AND
      ${body.code ? sql`materials.code LIKE ${'%' + body.code + '%'}` : sql`TRUE`} AND
      ${body.req ? sql`(select STRING_AGG(folio::TEXT, ', ') from requisitions where jobs LIKE CONCAT('%', jobs.ref, ',%') and jobs.ref is not null and requisitions."materialId" = materials.id) = ${body.req}` : sql`TRUE`} AND
      ${body.checked !== null ? sql`materialmovements.active = ${body.checked === 'true'}` : sql`TRUE`} AND
      ${body.type !== null ? sql`materialmovements.type = ${body.type}` : sql`TRUE`}
      ORDER BY materialmovements.active, COALESCE(jobs.due, imports.due, materialmovements."activeDate") DESC, materialmovements.id DESC
      LIMIT 150`;
    return movements;
  }

  async updateRealAmount(body: z.infer<typeof updateAmountSchema>) {
    const [movement] =
      await sql`select "materialId", active, extra, id, amount, "jobId" from materialmovements where id = ${body.id}`;

    if (!movement.jobId || movement.extra)
      throw new HttpException('Este movimiento no se puede editar', 400);

    if (movement.active)
      throw new HttpException('Este movimiento ya se surtio', 400);

    await sql`update materialmovements set "realAmount" = ${movement.amount >= 0 ? parseFloat(body.newAmount) : -parseFloat(body.newAmount)} where id = ${body.id}`;
  }

  async activateMovement(body: z.infer<typeof idObjectSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    const maintainDate = user.permissions.materialmovements >= 3;

    const [movement] =
      await sql`select extra, active, (select code from materials where id = "materialId"), (select ref from jobs where id = "jobId"), "jobId" from materialmovements where id = ${body.id}`;

    if (!movement.jobId || movement.extra)
      throw new HttpException('Este movimiento no se puede editar', 400);

    await sql.begin(async (sql) => {
      const [result] =
        await sql`UPDATE materialmovements SET active = ${!movement.active}, "activeDate" = ${movement.active ? (maintainDate ? sql`"activeDate"` : null) : sql`COALESCE("activeDate", ${new Date()})`} WHERE id = ${body.id} returning "materialId", "realAmount"`;

      await updateMaterialAmount(result.materialId, sql);

      await this.req.record(
        movement.active
          ? `Desactivo el movimiento del job ${movement.ref} y ${result.realAmount} ${movement.code}`
          : `Activo el movimiento del job ${movement.ref} y ${result.realAmount} ${movement.code}`,
        sql,
      );
    });

    return movement.active;
  }

  async postScrap(body: z.infer<typeof scrapSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [movement] =
          await sql`insert into materialmovements ("materialId", type, amount, "realAmount", active, "activeDate", extra) values
            ((select id from materials where code = ${body.code}),
            'scrap',
            ${-body.amount},
            ${-body.amount},
            true,
            ${new Date()},
            false) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);

        await this.req.record(
          `Retiro ${body.amount} de scrap de ${body.code}`,
          sql,
        );
      });
    } catch (err) {
      if (err.column_name === 'materialId')
        throw new HttpException(`El material ${body.code} no existe.`, 400);
    }
  }

  async postSupplies(body: z.infer<typeof suppliesSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [movement] =
          await sql`insert into materialmovements ("materialId", type, amount, "realAmount", active, "activeDate", extra) values
            ((select id from materials where code = ${body.code}),
            'consumable',
            ${-body.amount},
            ${-body.amount},
            true,
            ${new Date()},
            false) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);

        await this.req.record(
          `Retiro ${body.amount} de insumos de ${body.code}`,
          sql,
        );
      });
    } catch (err) {
      if (err.column_name === 'materialId')
        throw new HttpException(`El material ${body.code} no existe.`, 400);
    }
  }

  async postReturn(body: z.infer<typeof returnSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [movement] =
          await sql`insert into materialmovements ("materialId", type, amount, "realAmount", active, "activeDate", extra) values
            ((select id from materials where code = ${body.code}),
            'return',
            0,
            ${body.amount},
            true,
            ${new Date()},
            false) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);

        await this.req.record(
          `Hizo retorno de ${body.amount} de ${body.code}`,
          sql,
        );
      });
    } catch (err) {
      if (err.column_name === 'materialId')
        throw new HttpException(`El material ${body.code} no existe.`, 400);
    }
  }

  async postReposition(body: z.infer<typeof repositionSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "jobId", amount, "realAmount", active, "activeDate", extra) values
          ((select id from materials where code = ${body.code}),
          (select id from jobs where ref = ${body.job}),
          ${-body.amount},
          ${-body.amount},
          true,
          ${new Date()},
          true) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);

        await this.req.record(
          `Hizo una salida de ${body.amount} ${body.code} para el job ${body.job}`,
          sql,
        );
      });
    } catch (err) {
      if (err.column_name === 'materialId')
        throw new HttpException(`El material ${body.code} no existe.`, 400);
      if (err.column_name === 'jobId')
        throw new HttpException(`El job ${body.job} no existe.`, 400);
    }
  }

  async postLeftover(body: z.infer<typeof leftoverSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "jobId", amount, "realAmount", active, "activeDate", extra) values
            ((select id from materials where code = ${body.code}),
            (select id from jobs where ref = ${body.job}),
            ${body.amount},
            ${body.amount},
            true,
            ${new Date()},
            true) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);

        await this.req.record(
          `Hizo un retorno de ${body.amount} ${body.code} para el job ${body.job}`,
          sql,
        );
      });
    } catch (err) {
      if (err.column_name === 'materialId')
        throw new HttpException(`El material ${body.code} no existe.`, 400);
      if (err.column_name === 'jobId')
        throw new HttpException(`El job ${body.job} no existe.`, 400);
      throw err;
    }
  }

  async exportPending() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    const results = await sql`SELECT
      materials.code, materials.description, materials.measurement, materials."clientId", materials."leftoverAmount", materials.amount as inventory, materialmovements.amount, materialmovements."realAmount", materialmovements.id, jobs.due, jobs.ref, jobs.programation
      FROM materialmovements
      JOIN materials on materials.id = materialmovements."materialId"
      JOIN jobs on jobs.id = materialmovements."jobId"
      WHERE materialmovements.active = false
      ORDER BY jobs.due DESC, jobs.ref DESC, materials.code DESC, materialmovements.amount DESC, materialmovements.id DESC`;

    worksheet.columns = [
      { header: 'Programacion', key: 'programation', width: 16 },
      { header: 'Job', key: 'jobpo', width: 12 },
      { header: 'Material', key: 'code', width: 22 },
      { header: 'Descripcion', key: 'description', width: 22 },
      { header: 'Cantidad', key: 'amount', width: 15 },
      { header: 'Cantidad Real', key: 'realAmount', width: 15 },
      { header: 'Inventario', key: 'inventory', width: 20 },
      { header: 'Sobrante en area', key: 'leftoverAmount', width: 20 },
      { header: 'Medida', key: 'measurement', width: 14 },
    ];

    worksheet.addRows(results);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
