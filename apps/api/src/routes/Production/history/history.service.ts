import { BadRequestException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  getHistorySchema,
  getMovementsSchema,
  updateHistorySchema,
} from './history.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';
import { updateOrderAmounts } from '../production.utils';

@Injectable()
export class HistoryService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getHistorySchema>) {
    const orders = await sql`
    select id, programation, ref, part, "due", "clientId",
    amount, completed,
    CASE WHEN "serigrafiaTime" > 0 THEN "serigrafia" ELSE NULL END as "serigrafia",
    CASE WHEN "corteTime" > 0 THEN "corte" ELSE NULL END as "corte",
    CASE WHEN "cortesVariosTime" > 0 THEN "cortesVarios" ELSE NULL END as "cortesVarios",
    CASE WHEN "produccionTime" > 0 THEN "produccion" ELSE NULL END as "produccion",
    CASE WHEN "calidadTime" > 0 THEN "calidad" ELSE NULL END as "calidad"
    from jobs
    WHERE
      ${body.jobpo ? sql`ref LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`"clientId" = ${body.clientId}` : sql`TRUE`} AND
      completed = ${body.completed}
    order by "due" desc, ref desc limit 100
    `;
    return orders;
  }

  async getMovements(body: z.infer<typeof getMovementsSchema>) {
    const jobs = await sql`select id, created_at, date,
      corte, "cortesVarios", produccion, calidad, serigrafia
      from ordermovements where "progressId" = ${body.id} order by created_at desc`;
    return jobs;
  }

  async updateHistory(body: z.infer<typeof updateHistorySchema>) {
    await sql.begin(async (sql) => {
      const [order] = await sql`select *,
         (select SUM(${sql(body.area)})::integer from ordermovements om2 where om2."progressId" = ordermovements."progressId") as done,
         (select amount from jobs where id = ordermovements."progressId") as amount,
         (select ref from jobs where id = ordermovements."progressId") as ref
         from ordermovements where id = ${body.id}`;

      if (order.done - order[body.area] + body.amount > order.amount)
        throw new BadRequestException(
          'El progreso no puede ser mayor al total',
        );

      await sql`update ordermovements set ${sql(body.area)} = ${body.amount} where id = ${body.id}`;
      await updateOrderAmounts(order.progressId, sql);
      await this.req.record(
        `Actualizó ${body.area} de ${order.ref} a ${body.amount}pz`,
        sql,
      );
    });
  }

  async deleteHistory(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [order] =
        await sql`delete from ordermovements where id = ${body.id} returning "progressId"`;
      await updateOrderAmounts(order.progressId, sql);
      await this.req.record(`Eliminó un registro de producción`, sql);
    });
  }
}
