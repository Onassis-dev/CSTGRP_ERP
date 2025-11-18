import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { createPreformSchema, editPreformSchema } from './preform.schema';
import path from 'path';
import { promises as fs } from 'fs';
import { idObjectSchema } from 'src/utils/schemas';
import { format } from 'date-fns';
import { formatNumber } from './preform.utils';

@Injectable()
export class PreformService {
  constructor(private readonly req: ContextProvider) {}

  async get() {
    return await sql`select id, "noFactura", date from preforms order by date desc`;
  }

  async getOne(body: z.infer<typeof idObjectSchema>) {
    const [data] = await sql`select * from preforms where id = ${body.id}`;
    data.date = format(data.date, 'yyyy-MM-dd');
    return data;
  }

  async post(body: z.infer<typeof createPreformSchema>) {
    await sql`insert into preforms ${sql(body)}`;
  }

  async put(body: z.infer<typeof editPreformSchema>) {
    await sql`update preforms set ${sql(body)} where id = ${body.id}`;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql`delete from preforms where id = ${body.id}`;
  }

  async download(body: z.infer<typeof idObjectSchema>) {
    const [data] = await sql`select * from preforms where id = ${body.id}`;

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
        'ie',
        'preform.html',
      ),
      'utf-8',
    );

    data.clientsData = data.clientsData.map((row) => {
      const option = (data.unityOptions as any[]).find(
        ({ name }) => name === row.unidad,
      );

      return { ...row, inOut: option.inOut, almacenaje: option.almacenaje };
    });

    const separatedClientsData: {
      client: string;
      data: any[];
      total: number;
    }[] = [];

    data.clientsData.forEach((row) => {
      const index = separatedClientsData.findIndex(
        ({ client }) => client === row.client,
      );

      if (index === -1) {
        separatedClientsData.push({
          client: row.client,
          data: [row],
          total:
            Number(row.inOut) * Number(row.bultos) +
            Number(row.almacenaje) * Number(row.dias) * Number(row.bultos),
        });
      } else {
        separatedClientsData[index].data.push(row);
        separatedClientsData[index].total +=
          Number(row.inOut) * Number(row.bultos) +
          Number(row.almacenaje) * Number(row.dias) * Number(row.bultos);
      }
    });

    const totals = {
      exterior:
        data.exteriorData?.reduce((acc, row) => acc + Number(row.amount), 0) /
        Number(data.exchangeRate),
      mex:
        data.mexData?.reduce((acc, row) => acc + Number(row.amount), 0) /
        Number(data.exchangeRate),
      us: data.usData?.reduce((acc, row) => acc + Number(row.amount), 0),
      extra: data.extraData?.reduce((acc, row) => acc + Number(row.amount), 0),
      almacen: data.almacenData?.reduce(
        (acc, row) => acc + Number(row.amount) * Number(row.price),
        0,
      ),
      clients: separatedClientsData.reduce((acc, row) => acc + row.total, 0),
    };

    const total = Object.values(totals).reduce(
      (acc, row) => acc + Number(row),
      0,
    );

    const templateData = {
      ...data,
      date: format(data.date, 'MM-dd-yyyy'),
      exteriorData: data.exteriorData
        .map(
          (row) => `
          <tr>
            <td>${row.name}</td>
            <td>${formatNumber(row.amount)}</td>
          </tr>`,
        )
        .join(''),
      mexData: data.mexData
        .map(
          (row) => `
          <tr>
          <td>${row.name}</td>
          <td>${formatNumber(row.amount)}</td>
          </tr>`,
        )
        .join(''),
      usData: data.usData
        .map(
          (row) => `
          <tr>
            <td>${row.name}</td>
            <td>${formatNumber(row.amount)}</td>
            </tr>`,
        )
        .join(''),
      almacenData: data.almacenData
        .map(
          (row) => `
          <tr>
            <td>${row.name}</td>
            <td class="centered-cell">${row.amount}</td>
            <td>${formatNumber(row.price)}</td>
            <td>${formatNumber(Number(row.amount) * Number(row.price))}</td>
            </tr>`,
        )
        .join(''),
      extraData: data.extraData
        .map(
          (row) => `
          <tr>
            <td>${row.name}</td>
            <td>${formatNumber(row.amount)}</td>
            </tr>`,
        )
        .join(''),
      clientsData: separatedClientsData
        .map(
          ({ client, data, total }) => `
        <thead>
          <th colspan="7">CLIENTE: ${client}</th>
          <th>USD</th>
        </thead>
        <tbody>
          <tr class="subheader">
            <td>ENTRADA</td>
            <td class="centered-cell">BULTOS</td>
            <td>UNIDAD</td>
            <td>IN/OUT</td>
            <td class="centered-cell">DIAS</td>
            <td>ALMACENAJE</td>
            <td>ORDEN DE COMPRA</td>
            <td></td>
          </tr>
          ${data
            .map(
              (row) => `
            <tr>
              <td>${row.entrada}</td>
              <td class="centered-cell">${row.bultos}</td>
              <td>${row.unidad}</td>
              <td>${formatNumber(Number(row.inOut) * Number(row.bultos))}</td>
              <td class="centered-cell">${row.dias}</td>
              <td>${formatNumber(Number(row.almacenaje) * Number(row.dias) * Number(row.bultos))}</td>
              <td>${row.orden}</td>
              <td>${formatNumber(Number(row.inOut) * Number(row.bultos) + Number(row.almacenaje) * Number(row.dias) * Number(row.bultos))}</td>
            </tr>
          `,
            )
            .join('')}
                <tr>
                  <td colspan="7"></td>
                  <td class="total-cell">TOTAL: ${formatNumber(total)}</td>
                </tr>
            </tr>
        </tbody>
        `,
        )
        .join(''),
      totalExterior: formatNumber(
        data.exteriorData?.reduce((acc, row) => acc + Number(row.amount), 0),
      ),

      totalMex: formatNumber(
        data.mexData?.reduce((acc, row) => acc + Number(row.amount), 0) +
          data.exteriorData?.reduce((acc, row) => acc + Number(row.amount), 0),
      ),
      totalMexUSD: formatNumber(
        (data.mexData?.reduce((acc, row) => acc + Number(row.amount), 0) +
          data.exteriorData?.reduce(
            (acc, row) => acc + Number(row.amount),
            0,
          )) /
          Number(data.exchangeRate),
      ),

      staticTable: data.unityOptions
        .map(
          (option) => `
      <tr>
        <td>${option.name}</td>
        <td>${formatNumber(option.inOut)}</td>
        <td>${formatNumber(option.almacenaje)}</td>
      </tr>
      `,
        )
        .join(''),

      totalUs: formatNumber(totals.us),
      totalExtra: formatNumber(totals.extra),
      totalAlmacen: formatNumber(totals.almacen),
      totalUSD: formatNumber(total),
      totalMXN: formatNumber(total * Number(data.exchangeRate)),
      comments: data.comments || '-',
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
      footerTemplate: `
  <div style="font-size:11px; width:100%; padding: 0 0.7in; color:#555; display:flex; justify-content:space-between; align-items:center;">
      <div>
        CST GROUP INC
      </div>
    </div>
  `,
    });

    await browser.close();

    return pdf;
  }
}
