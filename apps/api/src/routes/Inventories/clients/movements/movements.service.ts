import jwt from 'jsonwebtoken';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import sql from 'src/utils/db';
import { clientSchema, idSchema, IEFilterSchema } from './movements.schema';

@Injectable()
export class MovementsService {
  async getMaterialComparison(
    body: z.infer<typeof idSchema>,
    token: string,
    query: z.infer<typeof clientSchema>,
  ) {
    const clientId = await getUserName(token, query);

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
                AND extra = false
            GROUP BY "movementId"
        )
        AND materials."clientId" = ${clientId}

    ORDER BY
        materialmovements."activeDate" DESC,
        materialmovements.id DESC;`;

    const result = movements.filter(
      (movement) => movement?.due?.toISOString() !== '2024-01-01T00:00:00.000Z',
    );
    return result;
  }

  async getInventory(token: string, query: z.infer<typeof clientSchema>) {
    const clientId = await getUserName(token, query);

    const inventory =
      await sql`Select id, code, description, location,  measurement, clienttotal as amount from materials where "clientId" = ${clientId} order by code`;

    return inventory;
  }

  async getClients() {
    const rows = await sql`select name as value, name, color from clients`;
    return rows;
  }

  async getJobComparison(
    body: z.infer<typeof idSchema>,
    token: string,
    query: z.infer<typeof clientSchema>,
  ) {
    const clientId = await getUserName(token, query);

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

  async getJobs(
    body: z.infer<typeof IEFilterSchema>,
    token: string,
    query: z.infer<typeof clientSchema>,
  ) {
    await getUserName(token, query);

    const movements = await sql`
      SELECT jobpo, created_at, due, id
      FROM materialie
      WHERE jobpo ~ '^\\d{6}$'
        ${
          body.code
            ? sql`AND (
              "jobpo" ILIKE ${'%' + body.code + '%'} OR 
              "programation" ILIKE ${'%' + body.code + '%'}
            )`
            : sql``
        }
      ORDER BY due DESC, created_at DESC, jobpo DESC`;
    return movements;
  }
}

async function getUserName(token: string, query: z.infer<typeof clientSchema>) {
  const user: any = await jwt.verify(token, process.env.JWT_SECRET);

  let [area] = await sql`select id from clients where name = ${user.username}`;
  if (!area && user.perm_inventory)
    [area] =
      await sql`select id from clients where name = ${query.clientId || ''}`;
  if (!area) throw new HttpException('Cliente no encontrado', 403);

  const [{ maintance }] =
    await sql`select maintance from users where username = ${user.username}`;
  if (maintance)
    throw new HttpException('Sorry, we are under maintenance', 503);

  return area.id;
}
