import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './products.schema';
import { z } from 'zod';
import sql from 'src/utils/db';

@Injectable()
export class ProductsService {
  async findAllProducts() {
    const products = await sql`Select * from purchaseproducts`;
    return products;
  }

  async createProduct(body: z.infer<typeof createSchema>) {
    await sql`insert into purchaseproducts ${sql(body)}`;
    return;
  }

  async editProduct(body: z.infer<typeof editSchema>) {
    await sql`update purchaseproducts set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteProduct(body: z.infer<typeof deleteSchema>) {
    await sql`delete from purchaseproducts where id = ${body.id}`;
    return;
  }

  async getCategories() {
    const categories =
      await sql`Select id as value, name from purchasecategories`;
    return categories;
  }
}
