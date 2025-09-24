import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { IEFilterSchema } from './movements.schema';
import { idObjectSchema } from 'src/utils/schemas';
import { ContextProvider } from 'src/interceptors/context.provider';
import exceljs from 'exceljs';

@Injectable()
export class MovementsService {
  constructor(private readonly req: ContextProvider) {}

  async getMaterialComparison(body: z.infer<typeof idObjectSchema>) {
    const clientId = await getClientId(this.req.userId.toString());

    const movements = await sql`SELECT 
        materialmovements."activeDate" as due,
        materialie.import,
        materialie.programation,
        materialie.jobpo,
        (
            SELECT SUM(amount) 
            FROM materialmovements AS m
            WHERE m."materialId" = materialmovements."materialId" AND m."movementId" = materialmovements."movementId" AND m.extra = false
        ) AS "amount",
        (
            SELECT SUM(amount) 
            FROM materialmovements AS m
            WHERE m."materialId" = materialmovements."materialId" AND m."movementId" = materialmovements."movementId"
        ) AS "realAmount",
        SUM((
            SELECT SUM(amount) 
            FROM materialmovements AS m
            WHERE m."materialId" = materialmovements."materialId" AND m."movementId" = materialmovements."movementId"
        )) OVER (ORDER BY materialmovements."activeDate" ASC, materialmovements.id ASC) AS balance
    FROM
        materialmovements
    JOIN
        materials ON materials.id = materialmovements."materialId"
    JOIN
        materialie ON materialie.id = materialmovements."movementId"
    WHERE
        materials.id = ${body.id}
        AND materialmovements.id IN (
            SELECT MAX(id)
            FROM materialmovements
            WHERE
                "materialId" = ${body.id}
                AND materials."clientId" = ${clientId}
                AND active = true
            GROUP BY "movementId"
        )
        AND materials."clientId" = ${clientId}

    ORDER BY
        materialmovements."activeDate" DESC,
        materialmovements.id DESC;`;

    //TODO: Fix this to be in sql
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = movements.filter(
      (movement) => movement?.due >= sixMonthsAgo,
    );
    return result;
  }

  async getInventory() {
    const [{ clientId }] =
      await sql`select "clientId" from users where id = ${this.req.userId}`;

    const inventory =
      await sql`Select id, code, description, location,  measurement, clienttotal as amount from materials where "clientId" = ${clientId} order by code`;

    return inventory;
  }

  async export() {
    const [{ clientId }] =
      await sql`select "clientId" from users where id = ${this.req.userId}`;

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    const rows = await sql`select
      id, code, description, total, measurement
      from materials where "clientId" = ${clientId}`;

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
      { header: 'CODE', key: 'code', width: 25 },
      { header: 'DESCRIPTION', key: 'description', width: 120 },
      { header: 'AMOUNT', key: 'total', width: 15 },
      { header: 'UOM', key: 'measurement', width: 14 },
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

  async getJobComparison(body: z.infer<typeof idObjectSchema>) {
    const [{ clientId }] =
      await sql`select "clientId" from users where id = ${this.req.userId}`;

    const movements = await sql`SELECT
    materials.code,
    materials.measurement,
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
        materialmovements."movementId" = ${body.id} 
        AND materialmovements.active IS true
        AND materials."clientId" = ${clientId}
        AND materialmovements.extra = false
    ORDER BY
        materialie.due DESC;`;

    return movements;
  }

  async getJobs(body: z.infer<typeof IEFilterSchema>) {
    const clientId = await getClientId(this.req.userId);

    const movements = await sql`
      SELECT jobpo, created_at, due, id
      FROM materialie
      WHERE "clientId" = ${clientId}
        ${body.code ? sql`AND ("jobpo" ILIKE ${'%' + body.code + '%'})` : sql``}
      ORDER BY due DESC, created_at DESC, jobpo DESC limit 200`;
    return movements;
  }
}

async function getClientId(userId: string) {
  const [user] = await sql`select "clientId" from users where id = ${userId}`;

  if (!user || !user.clientId)
    throw new HttpException('Cliente no encontrado', 403);

  const [{ maintance }] =
    await sql`select maintance from users where id = ${userId}`;
  if (maintance)
    throw new HttpException('Sorry, we are under maintenance', 503);

  return user.clientId;
}
