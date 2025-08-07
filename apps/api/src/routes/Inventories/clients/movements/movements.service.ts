import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { IEFilterSchema } from './movements.schema';
import { idObjectSchema } from 'src/utils/schemas';
import { ContextProvider } from 'src/interceptors/context.provider';

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
                AND extra = false
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
