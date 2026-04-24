import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import { ContextProvider } from 'src/interceptors/context.provider';
import {
  downloadPaymentsSchema,
  getDeliveriesForPaymentSchema,
} from './payments.schema';
import sql from 'src/utils/db';

@Injectable()
export class PaymentsService {
  constructor(private readonly req: ContextProvider) {}

  async download(body: z.infer<typeof downloadPaymentsSchema>) {
    const rows = await sql`select rejected, accepted, date, "orderId",
    (select ref from jobs where id = "orderId"),

    (select "contractorId" from "exitPass" where id = 
      (select "exitId" from jobs where id = "orderId"))
        

    FROM contractormovements
    WHERE id in ${sql(body.deliveriesId)}`;

    for (const row of rows) {
      const [job] = await sql`
        select COALESCE(materials.code, jobs.part) as part
        from jobs
        left join materialmovements on jobs."movementId" = materialmovements.id
        left join materials on materialmovements."materialId" = materials.id
        where jobs.id = ${row.orderId}`;
      if (!job) throw new HttpException('Job no encontrado', 400);

      const [priceRow] = await sql`
      select price, 
      (select name from contractors where id = "contractorId") as contractor
      from contractor_prices
      where "contractorId" = ${row.contractorId}
      and part = ${job.part}`;
      if (!priceRow)
        throw new HttpException(`Precio no encontrado: ${job.part}`, 400);

      row.contractor = priceRow.contractor;
      row.part = job.part;
      row.price = priceRow.price;
      row.total = row.accepted * priceRow.price;
    }

    function asciiTable(rows: Record<string, unknown>[], columns: string[]) {
      const cell = (v: unknown) => String(v ?? '');
      const widths = columns.map((c) =>
        Math.max(c.length, ...rows.map((r) => cell(r[c]).length)),
      );
      const line = (cells: string[]) =>
        '| ' + cells.map((t, i) => t.padEnd(widths[i])).join(' | ') + ' |';
      const sep = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
      const out = [sep, line(columns), sep];
      for (const r of rows) out.push(line(columns.map((c) => cell(r[c]))));
      out.push(sep);
      return out.join('\n');
    }

    return asciiTable(rows, [
      'rejected',
      'accepted',
      'date',
      'ref',
      'part',
      'contractor',
      'price',
      'total',
    ]);
  }

  async getDeliveriesForPayment(
    body: z.infer<typeof getDeliveriesForPaymentSchema>,
  ) {
    const deliveries = await sql`select id, rejected, accepted, date, 
    (select ref from jobs where id = "orderId"),
    (select name from contractors where id = 
      (select "contractorId" from "exitPass" where id = 
        (select "exitId" from jobs where id = "orderId"))) as contractor

    FROM contractormovements
    WHERE date >= ${body.startDate} AND date <= ${body.endDate}
    AND approved = true
    ORDER BY date ASC`;

    return deliveries;
  }
}
