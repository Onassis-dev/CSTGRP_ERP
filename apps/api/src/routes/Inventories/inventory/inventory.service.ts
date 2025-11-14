import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import exceljs from 'exceljs';
import { idObjectSchema } from 'src/utils/schemas';
import { z } from 'zod/v4';
import { exportHistorySchema } from './inventory.schema';

@Injectable()
export class InventoryService {
  async getInventory() {
    const inventory = await sql`Select * from materials order by "code" asc`;

    return inventory;
  }

  async getMaterialMovements(body: z.infer<typeof idObjectSchema>) {
    const movements = await sql`SELECT
        materialmovements."activeDate",
        materialie.programation,
        materialie.jobpo,
        materialie.import,
        materialmovements.amount,
        materialmovements.extra,
        materialmovements."realAmount",
        materialmovements.active,
        SUM(materialmovements."realAmount") OVER (ORDER BY materialmovements."activeDate" ASC, materialmovements.id ASC) AS balance,
        SUM(materialmovements."amount") OVER (ORDER BY materialmovements."activeDate" ASC, materialmovements.id ASC) AS "totalBalance"
        FROM
            materialmovements
        JOIN
            materials ON materials.id = materialmovements."materialId"
        JOIN
            materialie ON materialie.id = materialmovements."movementId"
        WHERE
            materials.id = ${body.id} 
            AND  materialmovements.active is true
            AND (materialie.location IS NULL OR materialie.location = 'At CST, Qtys verified')
        ORDER BY
            materialmovements."activeDate" DESC,
            materialmovements.id DESC
        LIMIT 300`;
    return movements;
  }

  async exportMaterialmMovements(body: z.infer<typeof idObjectSchema>) {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    const movments = await this.getMaterialMovements(body);
    const rows = movments.map((movement) => ({
      ...movement,
      jobpo: movement.jobpo || '' + (movement.extra ? ' -R' : ''),
    }));

    worksheet.columns = [
      { header: 'Job', key: 'jobpo', width: 15 },
      { header: 'Programación', key: 'programation', width: 15 },
      { header: 'Importación', key: 'import', width: 15 },
      { header: 'Cantidad Job', key: 'amount', width: 15 },
      { header: 'Cantidad Real', key: 'realAmount', width: 15 },
      { header: 'Fecha', key: 'activeDate', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Total Balance', key: 'totalBalance', width: 15 },
    ];

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    return workbook.xlsx.writeBuffer();
  }

  async getMaterialComparison(body: z.infer<typeof idObjectSchema>) {
    const movements = await sql`SELECT
    materialmovements."activeDate" as due,
    materialie.programation,
    materialie.jobpo,
    materialmovements.amount,
    (
        SELECT SUM(amount) 
        FROM materialmovements AS m
        WHERE m."materialId" = materialmovements."materialId" AND m."movementId" = materialmovements."movementId"
    ) AS "realAmount"
        FROM
        materialmovements
    JOIN
        materials ON materials.id = materialmovements."materialId"
    JOIN
        materialie ON materialie.id = materialmovements."movementId"
    WHERE
        materials.id = ${body.id} 
        AND materialmovements.active IS true
        AND materialie.jobpo IS NOT NULL
        AND materialmovements.extra = false
    ORDER BY
        materialmovements."activeDate" DESC,
        materialmovements.id DESC
    LIMIT 300;`;

    return movements;
  }

  async export() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    const rows = await sql`select
      id, code, description, total, "leftoverAmount", amount, measurement,
      (select name from clients where id = "clientId") as client
      from materials`;

    const results = await Promise.all(
      rows.map(async (row) => {
        const movements = await sql`SELECT jobpo FROM materialmovements
          JOIN materialie ON materialie.id = materialmovements."movementId"
          WHERE materialmovements.active = true
          AND materialie.jobpo IS NOT NULL
          AND materialmovements."materialId" = ${row.id}
          ORDER BY materialmovements."activeDate" DESC, materialie.id DESC
          LIMIT 25`;

        for (let i = 0; i < 25; i++) {
          row['job' + i] = movements[i]?.jobpo;
        }

        return row;
      }),
    );

    worksheet.columns = [
      { header: 'Material', key: 'code', width: 25 },
      { header: 'Descripcion', key: 'description', width: 120 },
      { header: 'Cantidad', key: 'amount', width: 15 },
      { header: 'Sobrante en area', key: 'leftoverAmount', width: 20 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Medida', key: 'measurement', width: 14 },
      { header: 'Cliente', key: 'client', width: 15 },
      { header: 'Job 1', key: 'job0', width: 12 },
      { header: 'Job 2', key: 'job1', width: 12 },
      { header: 'Job 3', key: 'job2', width: 12 },
      { header: 'Job 4', key: 'job3', width: 12 },
      { header: 'Job 5', key: 'job4', width: 12 },
      { header: 'Job 6', key: 'job5', width: 12 },
      { header: 'Job 7', key: 'job6', width: 12 },
      { header: 'Job 8', key: 'job7', width: 12 },
      { header: 'Job 9', key: 'job8', width: 12 },
      { header: 'Job 10', key: 'job9', width: 12 },
      { header: 'Job 11', key: 'job10', width: 12 },
      { header: 'Job 12', key: 'job11', width: 12 },
      { header: 'Job 13', key: 'job12', width: 12 },
      { header: 'Job 14', key: 'job13', width: 12 },
      { header: 'Job 15', key: 'job14', width: 12 },
      { header: 'Job 16', key: 'job15', width: 12 },
      { header: 'Job 17', key: 'job16', width: 12 },
      { header: 'Job 18', key: 'job17', width: 12 },
      { header: 'Job 19', key: 'job18', width: 12 },
      { header: 'Job 20', key: 'job19', width: 12 },
      { header: 'Job 21', key: 'job20', width: 12 },
      { header: 'Job 22', key: 'job21', width: 12 },
      { header: 'Job 23', key: 'job22', width: 12 },
      { header: 'Job 24', key: 'job23', width: 12 },
      { header: 'Job 25', key: 'job24', width: 12 },
    ];

    worksheet.addRows(results);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportHistory(body: z.infer<typeof exportHistorySchema>) {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Historial-inventario');

    const rows =
      await sql`select materials.code, SUM(materialmovements.amount * -1) as amount
    from materialmovements
    join materials on materials.id = materialmovements."materialId"
    where "activeDate" >= ${body.startDate} and "activeDate" <= ${body.endDate} and materialmovements.amount < 0
    group by code `;

    worksheet.columns = [
      { header: 'Material', key: 'code', width: 35 },
      { header: 'Cantidad gastada', key: 'amount', width: 25 },
    ];

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
