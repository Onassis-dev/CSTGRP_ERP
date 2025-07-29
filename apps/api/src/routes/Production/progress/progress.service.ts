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

    const jobs = await sql`select materialie.*, orders.*
       from orders join materialie on orders."jobId" = materialie.id 
       where ${sql(`${body.area}Time`)} <> 0
       ${body.completed ? sql`AND (orders.completed = true OR ${sql('orders.' + body.area)} = orders.amount)` : sql`AND orders.completed = false AND ${sql('orders.' + body.area)} < orders.amount`}
       ${body.job ? sql`AND materialie.jobpo LIKE ${'%' + body.job + '%'}` : sql``}
       ${body.programation ? sql`AND materialie.programation LIKE ${'%' + body.programation + '%'}` : sql``}
        order by materialie.jobpo desc limit 150`;

    return jobs;
  }

  async getOrderHistory(body: z.infer<typeof getHistorySchema>) {
    await validatePerm(body.area, this.req.userId, 1);

    const movements =
      await sql`select * from ordermovements where "progressId" = ${body.id} and ${sql(body.area)} <> 0`;
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

      await sql`insert into ordermovements (created_at, "progressId", ${sql(body.area)}) values (${getTijuanaDate()}, ${body.orderId}, ${body.amount})`;
      await updateOrderAmounts(body.orderId, sql);
      await this.req.record(
        `Agregó ${body.amount}pz a ${body.area}, orden: ${order.jobpo}`,
        sql,
      );
    });
  }
}

async function validatePerm(area: string, userId: string, required: 1 | 2) {
  const [{ perm }] =
    await sql`select ${sql('perm_prod_' + area)} as perm from users where id = ${userId}`;
  if (perm < required) throw new BadRequestException('Permiso insuficiente.');
}
