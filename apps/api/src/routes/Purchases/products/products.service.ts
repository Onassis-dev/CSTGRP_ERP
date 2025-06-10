import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  searchSchema,
} from './products.schema';
import { z } from 'zod';
import sql from 'src/utils/db';

@Injectable()
export class ProductsService {
  async findAllProducts(body: z.infer<typeof searchSchema>) {
    const products =
      await sql`Select *, (select name from purchasecategories where id = purchaseproducts."categoryId") as category from purchaseproducts
     ${body.name ? sql`WHERE code ILIKE ${'%' + body.name + '%'}` : sql``}
     ${body.name ? sql`OR description ILIKE ${'%' + body.name + '%'}` : sql``}        order by id desc limit 150`;
    return products;
  }

  async findAllProductsSuppliers(body: z.infer<typeof deleteSchema>) {
    const suppliers =
      await sql`Select "supplierId" as id from products_suppliers where "productId" = ${body.id}`;
    return suppliers.map((supplier) => supplier.id);
  }

  async createProduct(body: z.infer<typeof createSchema>) {
    const suppliers = body.suppliers;
    delete body.suppliers;
    const [row] =
      await sql`insert into purchaseproducts ${sql(body)} returning id`;
    await sql`insert into products_suppliers ${sql(suppliers.map((supplier) => ({ productId: row.id, supplierId: supplier })))}`;
  }

  async editProduct(body: z.infer<typeof editSchema>) {
    const suppliers = body.suppliers;
    delete body.suppliers;
    await sql`update purchaseproducts set ${sql(body)} where id = ${body.id}`;
    await sql`delete from products_suppliers where "productId" = ${body.id}`;
    await sql`insert into products_suppliers ${sql(suppliers.map((supplier) => ({ productId: body.id, supplierId: supplier })))}`;
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

  async getSuppliers() {
    const suppliers =
      await sql`Select id as value, name from purchasesuppliers order by name`;
    return suppliers;
  }
}
