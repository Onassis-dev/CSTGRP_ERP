import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  downloadPackingListSchema,
  editPackingListSchema,
} from './packing-list.schema';
import path from 'path';
import { promises as fs } from 'fs';
import { idObjectSchema } from 'src/utils/schemas';
import { format } from 'date-fns';

@Injectable()
export class PackingListService {
  constructor(private readonly req: ContextProvider) {}

  async getOptions() {
    const carriers =
      await sql`select id as value, name as name from carriers order by name`;
    const shippers =
      await sql`select id as value, name as name from shippers order by name`;
    const destinations =
      await sql`select id as value, name as name from "destinationDirections" order by name`;

    return { carriers, shippers, destinations };
  }

  async getData(body: z.infer<typeof idObjectSchema>) {
    const orders = await sql`select 
    order_destiny.id,
    materialie.jobpo,
    orders.part,
    order_destiny.amount,
    order_destiny.date,
    order_destiny.pallets

    from order_destiny
    left join orders on orders.id = order_destiny."orderId" 
    left join materialie on materialie.id = orders."jobId"
    where order_destiny."destinyId" = ${body.id}`;

    const [data] = await sql`select * from destinys where id = ${body.id}`;

    return { orders, data };
  }

  async update(body: z.infer<typeof editPackingListSchema>) {
    await sql.begin(async (sql) => {
      const [previousData] =
        await sql`select so from destinys where id = ${body.id}`;

      const headerData = await sql`select key, data from docs_data`;

      const orders = await sql`select 
      COALESCE(materialie.jobpo, '') as jobpo,
      COALESCE(orders.part, '') as part,
      COALESCE(order_destiny.amount, 0) as amount,
      COALESCE(order_destiny.po, '') as po,
      COALESCE(order_destiny.pallets, 0) as pallets,
      COALESCE(orders.description, '') as description,
      'EA' as umc
  
      from order_destiny
      left join orders on orders.id = order_destiny."orderId" 
      left join materialie on materialie.id = orders."jobId"
      where order_destiny."destinyId" = ${body.id}`;

      const packingData = {
        ...body,
        exported: headerData.find((item) => item.key === 'ie_exported')?.data,
        soldTo: headerData.find((item) => item.key === 'ie_sold_to')?.data,
        shipTo: headerData.find((item) => item.key === 'ie_ship_to')?.data,
        orders: orders,
      };

      await sql`update destinys set ${sql(packingData)} where id = ${body.id}`;

      await this.req.record(
        `Actualizo la informacion del packing list ${previousData.so}`,
        sql,
      );
    });
    return;
  }

  async download(body: z.infer<typeof downloadPackingListSchema>) {
    const [data] = await sql`select * from destinys where id = ${body.id}`;
    console.log(data);

    const browser = await puppeteer.launch();
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
        'ie',
        'packing-list.html',
      ),
      'utf-8',
    );

    const templateData = {
      ...data,
      shipDate: format(data.shipDate, 'MM-dd-yyyy'),
      rows: data.orders?.reduce((acc, order) => {
        return (
          acc +
          `
            <tr>
              <td>${order.part}</td>
              <td>${order.jobpo}</td>
              <td>${order.po}</td>
              <td class="description">${order.description}</td>
              <td>${order.umc}</td>
              <td>${order.amount}</td>
            </tr>`
        );
      }, ''),
    };

    await page.setContent(Mustache.render(template, templateData));

    const pdf = await page.pdf({
      format: 'letter',
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      printBackground: true,
    });

    await browser.close();

    return pdf;
  }
}
