import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import { HttpException, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { z } from 'zod/v4';
import { ContextProvider } from 'src/interceptors/context.provider';
import {
  createPaymentSchema,
  getAllPaymentsSchema,
  getDeliveriesForPaymentSchema,
} from './payments.schema';
import sql from 'src/utils/db';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class PaymentsService {
  constructor(private readonly req: ContextProvider) {}

  async getAll(body: z.infer<typeof getAllPaymentsSchema>) {
    const rows = await sql`select * from "contractorPayments"
    WHERE 
    ${body.date ? sql`"startDate" <= ${body.date} AND "endDate" >= ${body.date}` : sql`TRUE`} AND
    ${body.folio ? sql`folio = ${body.folio}` : sql`TRUE`}
    ORDER BY folio DESC`;
    return rows;
  }

  async create(body: z.infer<typeof createPaymentSchema>) {
    await sql.begin(async (sql) => {
      const [payment] =
        await sql`insert into "contractorPayments" ("startDate", "endDate", "folio") values 
        (${body.startDate}, ${body.endDate}, (select COALESCE(max(folio), 0) from "contractorPayments") + 1) 
        returning id`;

      for (const deliveryId of body.deliveriesId) {
        const [delivery] =
          await sql`update "contractormovements" set "paymentId" = ${payment.id} where id = ${deliveryId} and "paymentId" is null returning id`;
        if (!delivery)
          throw new HttpException('Una entrega ya tiene pago', 400);
      }
    });
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql`delete from "contractorPayments" where id = ${body.id}`;
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
    AND "paymentId" is null
    AND approved = true
    ORDER BY date ASC`;

    return deliveries;
  }

  async download(body: z.infer<typeof idObjectSchema>) {
    const [payment] =
      await sql`select * from "contractorPayments" where id = ${body.id}`;
    if (!payment) throw new HttpException('Pago no encontrado', 400);

    const rows = await sql`select rejected, accepted, date, "orderId",

    (select name from contractors where id = 
      (select "contractorId" from "exitPass" where id = 
        (select "exitId" from jobs where id = "orderId"))) as contractor

    FROM contractormovements
    WHERE "paymentId" = ${payment.id}
    ORDER BY date ASC`;

    for (const row of rows) {
      const [job] = await sql`
        select COALESCE(materials.code, jobs.part) as part, jobs.ref, jobs."contractorPrice", jobs.description
        from jobs
        left join materialmovements on jobs."movementId" = materialmovements.id
        left join materials on materialmovements."materialId" = materials.id
        where jobs.id = ${row.orderId}`;
      if (!job) throw new HttpException('Job no encontrado', 400);

      row.ref = job.ref;
      row.part = job.part;
      row.description = job.description;
      row.price = job.contractorPrice;
      row.total = row.accepted * job.contractorPrice;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/usr/bin/google-chrome'
          : undefined,
    });
    const page = await browser.newPage();

    const template = await fs.readFile(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'templates',
        'prod',
        'contrator-payment.html',
      ),
      'utf-8',
    );

    const contractorsGroups = {};

    for (const row of rows) {
      if (!row.contractor)
        throw new HttpException('Contratista no encontrado', 400);

      if (!contractorsGroups[row.contractor]) {
        contractorsGroups[row.contractor] = [];
      }

      contractorsGroups[row.contractor].push(row);
    }

    let tableHTML = '';

    for (const contractor of Object.keys(contractorsGroups)) {
      tableHTML += `
      
      <thead>
        <th class="contractor-cell" colspan="7">${contractor}</th>
      </thead>
      <thead class="subheader">
        <th>Fecha</th>
        <th>Orden</th>
        <th>Descripcion</th>
        <th>Precio C/U</th>
        <th>Aceptado</th>
        <th>Rechazado</th>
        <th>Total</th>
      </thead>
      <tbody>
      ${contractorsGroups[contractor]
        .map(
          (row) => `
        <tr>
          <td>${format(row.date, 'dd/MM/yyyy')}</td>
          <td>${row.ref}</td>
          <td class="description">${row.description}</td>
          <td>${row.price}</td>
          <td>${row.accepted}</td>
          <td>${row.rejected}</td>
          <td>${row.total}</td>
        </tr>
      `,
        )
        .join('')}
        <tr>
          <td colspan="7" class="total-cell">TOTAL: ${contractorsGroups[contractor].reduce((acc, row) => acc + row.total, 0)}</td>
        </tr>
      </tbody>`;
    }

    const templateData = {
      folio: payment.folio,
      startDate: format(payment.startDate, 'dd/MM/yyyy'),
      endDate: format(payment.endDate, 'dd/MM/yyyy'),
      total: rows.reduce((acc, row) => acc + row.total, 0),
      tableHTML,
    };

    await page.setContent(Mustache.render(template, templateData));

    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.7in',
        right: '0.7in',
        bottom: '0.7in',
        left: '0.7in',
      },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<span></span>`,
    });

    await browser.close();

    return pdf;
  }
}
