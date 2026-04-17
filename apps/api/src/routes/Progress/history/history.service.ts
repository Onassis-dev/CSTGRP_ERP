import { HttpException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  captureProgressSchema,
  updateHistorySchema,
  completeOrderSchema,
} from './history.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { calculateProgress } from './history.utils';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class HistoryService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof idObjectSchema>) {
    const movements =
      await sql`select progressmovements.*, operations.code, jobs.part 
      from progressmovements 
      join operations on progressmovements."operationId" = operations.id 
      join jobs on jobs.id = operations."orderId"
    where "orderId" = ${body.id} order by progressmovements.date desc`;
    return movements;
  }

  async post(body: z.infer<typeof captureProgressSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into progressmovements ${sql(body)}`;
      await calculateProgress(body.operationId, sql);
    });
  }

  async completeOrder(body: z.infer<typeof completeOrderSchema>) {
    const [order] =
      await sql`select "prodAmount" from jobs where id = ${body.id}`;
    if (!order || !order.prodAmount) {
      throw new HttpException('Orden no encontrada', 404);
    }

    await sql.begin(async (sql) => {
      const rows =
        await sql`insert into progressmovements (date, "operationId", added) 
      select ${body.date}, id, (select "prodAmount" from jobs where id = "orderId") - progress from operations 
      where "orderId" = ${body.id} and progress < (select "prodAmount" from jobs where id = "orderId")
      returning "operationId"`;

      for (const row of rows) {
        await calculateProgress(row.operationId, sql);
      }
    });
  }

  async put(body: z.infer<typeof updateHistorySchema>) {
    await sql.begin(async (sql) => {
      await sql`update progressmovements set ${sql(body)} where id = ${body.id}`;
      await calculateProgress(body.operationId, sql);
    });
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`delete from progressmovements where id = ${body.id} returning "operationId"`;
      await calculateProgress(row.operationId, sql);
    });
  }
}
