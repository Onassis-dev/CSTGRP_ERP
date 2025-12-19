import { HttpException, Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import { z } from 'zod/v4';
import { getExportSchema } from './export.schema';
import sql from 'src/utils/db';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class ExportService {
  constructor(private readonly context: ContextProvider) {}

  async findAll(filter: z.infer<typeof getExportSchema>) {
    return sql`select destinys.so, destinys.id, (destinys.exported IS NOT NULL) as exported
    from destinys 
    left join order_destiny on order_destiny."destinyId" = destinys.id
    left join jobs on jobs.id = order_destiny."orderId"
    ${filter.jobpo ? sql`where jobs.ref = ${filter.jobpo}` : sql``}
    group by destinys.id`;
  }

  async findOne(body: z.infer<typeof idObjectSchema>) {
    return sql`select 
    order_destiny.id,
    jobs.ref,
    jobs.part,
    order_destiny.amount,
    order_destiny.date,
    order_destiny.pallets

    from order_destiny
    left join jobs on jobs.id = order_destiny."orderId"
    where order_destiny."destinyId" = ${body.id}`;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    try {
      await sql.begin(async (sql) => {
        const [deleted] =
          await sql`delete from destinys where id = ${body.id} returning so`;
        if (deleted)
          await this.context.record(`Eliminó el destino ${deleted.so}`, sql);
      });
    } catch (error) {
      if (error.constraint_name === 'order_destiny_relation_1')
        throw new HttpException('El destino tiene ordenes asociadas', 400);
      throw error;
    }
  }
}
