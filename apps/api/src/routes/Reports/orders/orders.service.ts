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
    select jobs.id, jobs.programation, jobs.ref, jobs.part, jobs."due", jobs."clientId", jobs.invoiced,
    ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") as "time",
    (CASE WHEN jobs.invoiced THEN jobs.price ELSE 
      ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") * clients."hourPrice" / 60 END) as "price"
    from jobs
    join clients on clients.id = jobs."clientId"
    WHERE
      ${body.jobpo ? sql`jobs.ref LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`jobs.programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`jobs."clientId" = ${body.clientId}` : sql`TRUE`}
    order by jobs."due" desc, jobs.ref desc limit 150
    `;
    return orders;
  }

  async checkOrder(body: z.infer<typeof checkOrderSchema>) {
    await sql`update jobs set 
    invoiced = not invoiced,
    price = (select "hourPrice" from clients where id = (select "clientId" from jobs where id = ${body.id})) * ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") / 60
    where id = ${body.id}`;
  }
}
