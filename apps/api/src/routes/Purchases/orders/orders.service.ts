import { promises as fs } from 'fs';
import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getProductsSchema,
  searchSchema,
} from './orders.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateOrder } from './orders.generate';
import { markPage } from 'src/utils/pdf';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllOrders(body: z.infer<typeof searchSchema>) {
    const orders =
      await sql`Select *, (select name from purchasesuppliers where id = purchaseorders."supplierId") as supplier from purchaseorders
      ${body.name ? sql`WHERE folio::text ILIKE ${'%' + body.name + '%'}` : sql``}
      ${body.name ? sql`OR (select name from purchasesuppliers where id = purchaseorders."supplierId") ILIKE ${'%' + body.name + '%'}` : sql``}
      order by folio desc limit 150`;
    return orders;
  }

  async createOrder(body: z.infer<typeof createSchema>) {
    let net = 0;
    const products = body.products.map((material: any) => {
      material.total = material.price * material.quantity;
      net += material.total;
      return material;
    });

    const [lastOrder] =
      await sql`select max(folio) as folio from purchaseorders`;

    const [supplier] =
      await sql`select * from purchasesuppliers where id = ${body.supplierId}`;

    await sql`insert into purchaseorders ${sql({
      folio: lastOrder.folio + 1,
      issuer: body.issuer,
      supplierId: body.supplierId,
      currency: body.currency,
      comments: body.comments,
      iva: body.iva,
      net,
      products: JSON.stringify(products),
      supplier: JSON.stringify(supplier),
    })}`;
  }

  async editOrder(body: z.infer<typeof editSchema>) {
    let net = 0;
    const products = body.products.map((material: any) => {
      material.total = material.price * material.quantity;
      net += material.total;
      return material;
    });

    const extra: any = {};

    const [order] =
      await sql`select * from purchaseorders where id = ${body.id}`;

    if (Number(body.supplierId) !== Number(order.supplierId)) {
      const [supplier] =
        await sql`select * from purchasesuppliers where id = ${body.supplierId}`;
      extra.supplier = JSON.stringify(supplier);
    }

    await sql`update purchaseorders set ${sql({
      ...extra,
      issuer: body.issuer,
      supplierId: body.supplierId,
      currency: body.currency,
      comments: body.comments,
      iva: body.iva,
      net,
      products: JSON.stringify(products),
    })}`;
  }

  async deleteOrder(body: z.infer<typeof deleteSchema>) {
    await sql`delete from purchaseorders where id = ${body.id}`;
  }

  async getBasicData() {
    const suppliers =
      await sql`select id as value, name from purchasesuppliers`;
    const [issuer] =
      await sql`select username as value from users where id = ${this.req.userId}`;
    const [folio] =
      await sql`select max(folio) + 1 as value from purchaseorders`;

    return {
      suppliers,
      issuer: issuer.value || 'Sin usuario',
      folio: folio.value || 1,
    };
  }

  async getProducts(body: z.infer<typeof getProductsSchema>) {
    const products = await sql`
    SELECT id, code, description, price, image, measurement
    FROM purchaseproducts
     ${body.code ? sql`WHERE code ILIKE ${'%' + body.code + '%'}` : sql``}
     ${body.code ? sql`OR description ILIKE ${'%' + body.code + '%'}` : sql``}
    order by id desc LIMIT 50;
  `;
    return products;
  }

  async download(body: z.infer<typeof deleteSchema>) {
    const [order] =
      await sql`select * from purchaseorders where id = ${body.id}`;

    try {
      order.supplier = JSON.parse(order.supplier);
    } catch {}
    try {
      order.products = JSON.parse(order.products);
    } catch {}

    console.log(order);

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'oc.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page] = pdfDoc.getPages();

    const imageBytes = await fs.readFile(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'templates',
        'logo.png',
      ),
    );

    const logo = await pdfDoc.embedPng(imageBytes);

    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // markPage(page);

    generateOrder(page, font, bold, order, logo);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
