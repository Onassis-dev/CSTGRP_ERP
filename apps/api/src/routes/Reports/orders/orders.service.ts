import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { checkOrderSchema, getOrdersSchema } from './orders.schema';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getOrdersSchema>) {
    const orders = await sql`
    select orders.id, materialie.programation, materialie.jobpo, orders.part, materialie."due", materialie."clientId", orders.invoiced,
    ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") as "time",
    (CASE WHEN orders.invoiced THEN orders.price ELSE 
      ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") * clients."hourPrice" / 60 END) as "price"
    from orders
    join materialie on materialie.id = orders."jobId"
    join clients on clients.id = materialie."clientId"
    WHERE
      ${body.jobpo ? sql`materialie.jobpo LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`materialie.programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`materialie."clientId" = ${body.clientId}` : sql`TRUE`}
    order by materialie."due" desc, materialie.jobpo desc limit 150
    `;
    return orders;
  }

  async checkOrder(body: z.infer<typeof checkOrderSchema>) {
    await sql`update orders set 
    invoiced = not invoiced,
    price = (select "hourPrice" from clients where id = (select "clientId" from materialie where id = (select "jobId" from orders where id = ${body.id}))) * ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") / 60
    where id = ${body.id}`;
  }
}
