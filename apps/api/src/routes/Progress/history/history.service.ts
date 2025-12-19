import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { captureProgressSchema, updateHistorySchema } from './history.schema';
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
