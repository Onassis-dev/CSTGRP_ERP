import { BadRequestException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  captureProgressSchema,
  getHistorySchema,
  getProgressSchema,
} from './progress.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { updateOrderAmounts } from '../production.utils';
import { getTijuanaDate } from 'src/utils/functions';

@Injectable()
export class ProgressService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getProgressSchema>) {
    await validatePerm(body.area, this.req.userId, 1);

    const jobs = await sql`select materialie.*, orders.*,
       CASE 
         WHEN ${getTijuanaDate()} >= materialie."due" - INTERVAL '2 days' AND ${getTijuanaDate()} <= materialie."due" THEN 1
         WHEN ${getTijuanaDate()} > materialie."due" THEN 2
         ELSE 0
       END as "state"
       from orders join materialie on orders."jobId" = materialie.id 
       where ${sql(`${body.area}Time`)} <> 0
       ${body.completed ? sql`AND (orders.completed = true OR ${sql('orders.' + body.area)} = orders.amount)` : sql`AND orders.completed = false AND ${sql('orders.' + body.area)} < orders.amount`}
       ${body.job ? sql`AND materialie.jobpo LIKE ${'%' + body.job + '%'}` : sql``}
       ${body.programation ? sql`AND materialie.programation LIKE ${'%' + body.programation + '%'}` : sql``}
       AND orders."areaId" IN (SELECT unnest(prod_areas) FROM users WHERE id = ${this.req.userId})
       order by materialie.jobpo desc limit 150`;

    return jobs;
  }

  async getOrderHistory(body: z.infer<typeof getHistorySchema>) {
    await validatePerm(body.area, this.req.userId, 1);

    const movements =
      await sql`select * from ordermovements where "progressId" = ${body.id} and ${sql(body.area)} <> 0 order by date desc`;
    return movements;
  }

  async captureDailyProgress(body: z.infer<typeof captureProgressSchema>) {
    await validatePerm(body.area, this.req.userId, 2);

    await sql.begin(async (sql) => {
      const [order] = await sql`select SUM(${sql(body.area)})::integer as done,
         (select amount from orders where id = ${body.orderId}),
         (select jobpo from materialie where id = (select "jobId" from orders where id = ${body.orderId}))
          from ordermovements where "progressId" = ${body.orderId}`;

      if (order.done + body.amount > order.amount)
        throw new BadRequestException(
          'El progreso no puede ser mayor al total',
        );

      await sql`insert into ordermovements (date, "progressId", ${sql(body.area)}) values (${body.date}, ${body.orderId}, ${body.amount})`;
      await updateOrderAmounts(body.orderId, sql);

      await this.req.record(
        `Agregó ${body.amount}pz a ${body.area}, orden: ${order.jobpo}`,
        sql,
      );
    });
  }
}

async function validatePerm(area: string, userId: string, required: 1 | 2) {
  const [{ permissions }] =
    await sql`select permissions from users where id = ${userId}`;
  const perm = permissions[`prod_${area}`];
  if (perm < required) throw new BadRequestException('Permiso insuficiente.');
}
