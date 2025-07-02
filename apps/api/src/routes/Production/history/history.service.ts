import { BadRequestException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { updateHistorySchema } from './history.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';
import { updateOrderAmounts } from '../production.utils';

@Injectable()
export class HistoryService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders() {
    const jobs = await sql`select *,
    (select jobpo from materialie where id = (select "jobId" from orders where id = "progressId")) as jobpo
    from ordermovements order by id desc limit 150`;
    return jobs;
  }

  async updateHistory(body: z.infer<typeof updateHistorySchema>) {
    await sql.begin(async (sql) => {
      const [order] = await sql`select *,
         (select SUM(${sql(body.area)})::integer from ordermovements where "progressId" = "progressId") as done,
         (select amount from orders where id = "progressId"),
         (select jobpo from materialie where id = (select "jobId" from orders where id = "progressId")) as jobpo
         from ordermovements where id = ${body.id} group by id`;

      if (order.done - order[body.area] + body.amount > order.amount)
        throw new BadRequestException(
          'El progreso no puede ser mayor al total',
        );

      await sql`update ordermovements set ${sql(body.area)} = ${body.amount} where id = ${body.id}`;
      await updateOrderAmounts(order.progressId, sql);
      await this.req.record(
        `Actualizó ${body.area} de ${order.jobpo} a ${body.amount}pz`,
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
