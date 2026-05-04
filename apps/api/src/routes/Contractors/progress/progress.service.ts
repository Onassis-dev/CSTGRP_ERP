import { BadRequestException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  captureProgressSchema,
  getHistorySchema,
  getProgressSchema,
} from './progress.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { updateContractorAmounts } from '../contractors.utils';

@Injectable()
export class ProgressService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getProgressSchema>) {
    const jobs = await sql`select jobs.*, "exitPass"."contractorId"
       from jobs
       left join "exitPass" on "exitPass"."id" = jobs."exitId"
       where "contractorAmount" > 0
       ${body.completed ? sql`AND jobs."completedContractor" = true` : sql`AND jobs."completedContractor" = false`}
       ${body.job ? sql`AND jobs.ref LIKE ${'%' + body.job + '%'}` : sql``}
       ${body.programation ? sql`AND jobs.programation LIKE ${'%' + body.programation + '%'}` : sql``}
       ${body.contractorId ? sql`AND "exitPass"."contractorId" = ${body.contractorId}` : sql``}
       order by jobs.ref desc limit 200`;

    return jobs;
  }

  async getOrderHistory(body: z.infer<typeof getHistorySchema>) {
    const movements =
      await sql`select * from contractormovements where "orderId" = ${body.id} and approved = true order by date desc`;
    return movements;
  }

  async captureDailyProgress(body: z.infer<typeof captureProgressSchema>) {
    await sql.begin(async (sql) => {
      const [order] = await sql`select SUM(accepted)::integer as done,
         (select "contractorAmount" from jobs where id = ${body.orderId}) as amount,
         (select ref from jobs where id = ${body.orderId})
          from contractormovements where "orderId" = ${body.orderId}`;

      if (order.done + body.amount > order.amount)
        throw new BadRequestException(
          'El progreso no puede ser mayor al total',
        );

      await sql`insert into contractormovements (date, "orderId", amount) values (${body.date}, ${body.orderId}, ${body.amount})`;
      await updateContractorAmounts(body.orderId, sql);

      await this.req.record(
        `Agregó ${body.amount}pz a contratista, orden: ${order.ref}`,
        sql,
      );
    });
  }
}
