import { promises as fs } from 'fs';
import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getProductsSchema,
  searchSchema,
} from './orders.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateOrder } from './orders.generate';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllOrders(body: z.infer<typeof searchSchema>) {
    const orders =
      await sql`Select *, (select name from purchasesuppliers where id = purchaseorders."supplierId") as supplier from purchaseorders
      ${body.name ? sql`WHERE ref::text ILIKE ${'%' + body.name + '%'}` : sql``}
      ${body.name ? sql`OR (select name from purchasesuppliers where id = purchaseorders."supplierId") ILIKE ${'%' + body.name + '%'}` : sql``}
      order by ref desc limit 150`;
    return orders;
  }

  async createOrder(body: z.infer<typeof createSchema>) {
    let net = 0;
    const products = body.products.map((material: any) => {
      material.total = material.price * material.quantity;
      net += material.total;
      return material;
    });

    const [lastOrder] = await sql`select max(ref) as ref from purchaseorders`;

    const [supplier] =
      await sql`select * from purchasesuppliers where id = ${body.supplierId}`;

    await sql.begin(async (sql) => {
      await sql`insert into purchaseorders ${sql({
        ref: lastOrder.ref + 1,
        issuer: body.issuer,
        supplierId: body.supplierId,
        currency: body.currency,
        comments: body.comments,
        iva: body.iva,
        business: body.business,
        net,
        products: JSON.stringify(products),
        supplier: JSON.stringify(supplier),
      })}`;
      await this.req.record(`Creo la orden ${lastOrder.ref + 1}`, sql);
    });
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

    await sql.begin(async (sql) => {
      await sql`update purchaseorders set ${sql({
        ...extra,
        created_at: new Date(),
        issuer: body.issuer,
        supplierId: body.supplierId,
        currency: body.currency,
        comments: body.comments,
        iva: body.iva,
        net,
        products: JSON.stringify(products),
        business: body.business,
      })}
      where id = ${body.id}`;
      await this.req.record(`Edito la orden ${body.id}`, sql);
    });
  }

  async deleteOrder(body: z.infer<typeof deleteSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`delete from purchaseorders where id = ${body.id} returning *`;
      await this.req.record(`Borro la orden ${row.ref}`, sql);
    });
  }

  async getBasicData() {
    const suppliers =
      await sql`select id as value, name from purchasesuppliers order by name`;
    const [issuer] =
      await sql`select username as value from users where id = ${this.req.userId}`;
    const [ref] = await sql`select max(ref) + 1 as value from purchaseorders`;

    return {
      suppliers,
      issuer: issuer.value || 'Sin usuario',
      ref: ref.value || 1,
    };
  }

  async getProducts(body: z.infer<typeof getProductsSchema>) {
    const products = await sql`
    SELECT id, code, description, price, image, measurement
    FROM purchaseproducts
    WHERE
     ${body.code ? sql`code ILIKE ${'%' + body.code + '%'}` : sql`TRUE`}
     ${body.code ? sql`OR description ILIKE ${'%' + body.code + '%'}` : sql`AND TRUE`}
     ${body.supplierId ? sql`AND EXISTS (SELECT 1 FROM products_suppliers WHERE "productId" = purchaseproducts.id AND "supplierId" = ${body.supplierId})` : sql`AND TRUE`}
    order by id desc LIMIT 80;
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

    const imagePathName = order.business === 1 ? 'bcpet.png' : 'mpm.png';

    const imageBytes = await fs.readFile(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'templates',
        imagePathName,
      ),
    );

    const logo = await pdfDoc.embedPng(imageBytes);

    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    generateOrder(page, font, bold, order, logo);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
