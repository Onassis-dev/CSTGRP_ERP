import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { getOrdersSchema } from './orders.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getOrdersSchema>) {
    const orders = await sql`
    select orders.id, materialie.programation, materialie.jobpo, orders.part, materialie."due", materialie."clientId",
    "produccionTime" as "time"
    from orders
    join materialie on materialie.id = orders."jobId"
    WHERE
      ${body.jobpo ? sql`materialie.jobpo LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`materialie.programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`materialie."clientId" = ${body.clientId}` : sql`TRUE`}
    order by materialie."due" desc, materialie.jobpo desc limit 150
    `;
    return orders;
  }

  async getOrder(params: z.infer<typeof idObjectSchema>) {
    const [order] = await sql`
      select orders.id, orders.part, orders.amount, materialie.jobpo,
      (select json_agg(operations order by id desc) from operations where "orderId" = orders.id) as operations
      from orders
      left join operations on operations."orderId" = orders.id
      left join materialie on materialie.id = orders."jobId"
      where orders.id = ${params.id}`;
    return order;
  }
}
