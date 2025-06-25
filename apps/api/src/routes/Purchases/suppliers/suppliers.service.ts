import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  searchSchema,
} from './suppliers.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class SuppliersService {
  constructor(private readonly req: ContextProvider) {}

  async findAllSuppliers(body: z.infer<typeof searchSchema>) {
    const suppliers = await sql`Select * from purchasesuppliers
      ${body.name ? sql`WHERE name ILIKE ${'%' + body.name + '%'}` : sql``}
      ${body.name ? sql`OR atention ILIKE ${'%' + body.name + '%'}` : sql``}
      order by name asc limit 150`;
    return suppliers;
  }

  async createSupplier(body: z.infer<typeof createSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into purchasesuppliers ${sql(body)}`;
      await this.req.record(`Creo el proveedor ${body.name}`, sql);
    });
  }

  async editSupplier(body: z.infer<typeof editSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`select name from purchasesuppliers where id = ${body.id}`;
      await sql`update purchasesuppliers set ${sql(body)} where id = ${body.id}`;
      await this.req.record(
        `Edito el proveedor ${row.name} a ${body.name}`,
        sql,
      );
    });
  }

  async deleteSupplier(body: z.infer<typeof deleteSchema>) {
    await sql.begin(async (sql) => {
      const [row] =
        await sql`delete from purchasesuppliers where id = ${body.id} returning *`;
      await this.req.record(`Borro el proveedor ${row.name}`, sql);
    });
  }
}
