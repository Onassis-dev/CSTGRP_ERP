import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { checkOrderSchema, getOrdersSchema } from './production.schema';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class ProductionService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getOrdersSchema>) {
    const orders = await sql`
    select orders.id, materialie.jobpo, orders.part, materialie."due", materialie."clientId", orders.invoiced,
    ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") as "time"
    from orders
    join materialie on materialie.id = orders."jobId"
    order by materialie."due" desc, materialie.jobpo desc limit 150`;
    return orders;
  }

  async checkOrder(body: z.infer<typeof checkOrderSchema>) {
    await sql`update orders set invoiced = not invoiced where id = ${body.id}`;
  }
}
