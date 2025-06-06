import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getProductsSchema,
} from './orders.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllOrders() {
    const orders = await sql`Select * from purchaseorders order by folio desc`;
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

    await sql`insert into purchaseorders ${sql({
      folio: lastOrder.folio + 1,
      issuer: body.issuer,
      supplierId: body.supplierId,
      currency: body.currency,
      comments: body.comments,
      iva: body.iva,
      net,
      products: JSON.stringify(products),
    })}`;
  }

  async editOrder(body: z.infer<typeof editSchema>) {
    await sql`update purchaseorders set ${sql(body)} where id = ${body.id}`;
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
    SELECT id, code, description, price, image
    FROM purchaseproducts
     ${body.code ? sql`WHERE code ILIKE ${'%' + body.code + '%'}` : sql``}
    LIMIT 50;
  `;
    return products;
  }
}
