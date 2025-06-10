import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './categories.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class CategoriesService {
  constructor(private readonly req: ContextProvider) {}

  async findAllCategories() {
    const categories =
      await sql`Select * from purchasecategories order by name asc`;
    return categories;
  }

  async createCategory(body: z.infer<typeof createSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into purchasecategories ${sql(body)}`;
      await this.req.record(`Creo la categoría ${body.name}`, sql);
    });
  }

  async editCategory(body: z.infer<typeof editSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`select name from purchasecategories where id = ${body.id}`;
      await sql`update purchasecategories set ${sql(body)} where id = ${body.id}`;
      await this.req.record(
        `Edito la categoría ${row.name} a ${body.name}`,
        sql,
      );
    });
  }

  async deleteCategory(body: z.infer<typeof deleteSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`delete from purchasecategories where id = ${body.id} returning *`;
      await this.req.record(`Borro la categoría ${row.name}`, sql);
    });
  }

  async importCategories(body: any) {
    await sql`delete from purchaseorders`;
    await sql`delete from purchaseproducts`;
    await sql`delete from purchasesuppliers`;
    await sql`delete from purchasecategories`;

    const currencies = {
      Pesos: 'MXN',
      pesos: 'MXN',
      Dolar: 'USD',
      dolar: 'USD',
    };

    // categories
    const categories = [];
    for (const category of body.categorias) {
      categories.push({
        id: category.id,
        name: category.categoria,
        created_at: category.fecha,
      });
    }
    await sql`insert into purchasecategories ${sql(categories)}`;

    // suppliers
    const clients = [];
    for (const client of body.clientes) {
      if (isNaN(new Date(client.ultima_compra).getTime())) {
        client.ultima_compra = null;
      }

      clients.push({
        id: client.id,
        name: client.nombre,
        document: client.documento,
        email: client.email,
        phone: client.telefono,
        direction: client.direccion,
        bornDate: client.fecha ? new Date(client.fecha) : null,
        purchases: client.compras,
        lastPurchase: client.ultima_compra
          ? new Date(client.ultima_compra)
          : null,
        currency: currencies[client.tipo_moneda],
        atention: client.atencion,
      });
    }

    await sql`insert into purchasesuppliers ${sql(clients)}`;

    // products
    const products = [];
    for (const product of body.productos) {
      if (product.id_categoria === '0') {
        product.id_categoria = 8;
      }

      products.push({
        id: product.id,
        code: product.codigo,
        categoryId: product.id_categoria,
        description: product.descripcion,
        stock: product.stock,
        price: product.precio_compra,
        purchases: product.ventas,
        measurement: product.tipo_unidad,
        created_at: product.fecha,
      });
    }
    await sql`insert into purchaseproducts ${sql(products)}`;

    // orders
    const orders = [];
    for (const order of body.ordenes) {
      const vendors = {
        '62': 'Aracely Varguez',
        '61': 'Efrain Lopez',
      };

      const productsJson = JSON.parse(order.productos).map((product: any) => {
        return {
          id: product.id,
          code: product.codigo,
          description: product.descripcion,
          quantity: product.cantidad,
          price: product.precio,
          total: product.total,
          measurement:
            products.find((p: any) => String(p.id) === String(product.id))
              ?.measurement || '',
        };
      });

      if (order.id_cliente === '38') order.id_cliente = 6;

      const [supplier] =
        await sql`select * from purchasesuppliers where id = ${order.id_cliente}`;

      orders.push({
        id: order.id,
        created_at: order.fecha,
        folio: order.codigo,
        supplierId: order.id_cliente,
        issuer: vendors[order.id_vendedor],
        net: order.neto,
        iva: order.iva,
        currency: currencies[order.tipo_moneda] || 'MXN',
        comments: order.comentario,
        products: productsJson,
        supplier: supplier,
      });
    }
    await sql`insert into purchaseorders ${sql(orders)}`;
  }
}
