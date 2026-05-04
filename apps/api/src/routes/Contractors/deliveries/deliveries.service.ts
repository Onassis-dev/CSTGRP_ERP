import { HttpException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  getDeliveriesSchema,
  approveDeliveriesSchema,
} from './deliveries.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { updateContractorAmounts } from '../contractors.utils';

@Injectable()
export class DeliveriesService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof getDeliveriesSchema>) {
    const jobs =
      await sql`select contractormovements.*, "exitPass"."contractorId",
     jobs.ref, jobs.programation, jobs.part, jobs.description
     from contractormovements
    join jobs on jobs.id = contractormovements."orderId"
    join "exitPass" on "exitPass".id = jobs."exitId"
    WHERE TRUE
    ${body.approved ? sql`AND contractormovements.approved = true` : sql`AND contractormovements.approved = false`}
    ${body.job ? sql`AND jobs.ref LIKE ${'%' + body.job + '%'}` : sql``}
    ${body.programation ? sql`AND jobs.programation LIKE ${'%' + body.programation + '%'}` : sql``}
    ${body.contractorId ? sql`AND "exitPass"."contractorId" = ${body.contractorId}` : sql``}
    limit 200
    `;

    return jobs;
  }

  async approveDeliveries(body: z.infer<typeof approveDeliveriesSchema>) {
    await sql.begin(async (sql) => {
      const [delivery] =
        await sql`select * from contractormovements where id = ${body.id}`;

      if (body.rejected > delivery.amount)
        throw new HttpException(
          'La cantidad rechazada no puede ser mayor a la cantidad entregada',
          400,
        );

      await sql`update contractormovements set approved = true, rejected = ${body.rejected} where id = ${body.id}`;

      await updateContractorAmounts(delivery.orderId, sql);

      await this.req.record(
        `Aprobó la entrega de ${delivery.amount}pz de la orden: ${delivery.ref}`,
        sql,
      );
    });
  }
}
