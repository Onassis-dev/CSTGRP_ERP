import { Injectable } from '@nestjs/common';
import {
  getDestinationsSchema,
  orderFilterSchema,
  updateDestinationPalletsSchema,
} from './orders.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllOrders(query: z.infer<typeof orderFilterSchema>) {
    const orders = await sql`
      SELECT orders.id, orders.part, orders.amount, materialie.jobpo, materialie.programation, materialie.due FROM orders 
      JOIN materialie ON materialie.id = orders."jobId"
      WHERE
        ${query.jobpo ? sql`materialie.jobpo LIKE ${'%' + query.jobpo + '%'}` : sql`TRUE`} AND
        ${query.programation ? sql`materialie.programation LIKE ${'%' + query.programation + '%'}` : sql`TRUE`} AND
        ${query.part ? sql`orders.part LIKE ${'%' + query.part + '%'}` : sql`TRUE`}
      ORDER BY id DESC
    `;
    return orders;
  }

  async findDestinations(query: z.infer<typeof getDestinationsSchema>) {
    const destination = await sql`
      SELECT 
        order_destiny.id,
        destinys.so,
        order_destiny.amount,
        order_destiny.date,
        order_destiny.pallets
      FROM order_destiny 
      JOIN destinys on destinys.id = order_destiny."destinyId"
      WHERE order_destiny."orderId" = ${query.id}
      ORDER BY order_destiny.date DESC, order_destiny.id DESC
    `;

    const [order] = await sql`SELECT 
    materialie.jobpo,
    materialie.programation,
    orders.part,
    orders.amount,
    materialie.due,
    orders."perBox"
    FROM orders join materialie on materialie.id = orders."jobId" WHERE orders.id = ${query.id}`;

    return {
      ...order,
      destinations: destination,
    };
  }

  async updateDestinationPallets(
    body: z.infer<typeof updateDestinationPalletsSchema>,
  ) {
    await sql`update order_destiny set pallets = ${body.pallets} where id = ${body.id}`;
  }
}
