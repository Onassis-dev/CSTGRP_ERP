import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  searchSchema,
} from './suppliers.schema';
import { z } from 'zod';
import sql from 'src/utils/db';

@Injectable()
export class SuppliersService {
  async findAllSuppliers(body: z.infer<typeof searchSchema>) {
    const suppliers = await sql`Select * from purchasesuppliers
      ${body.name ? sql`WHERE name ILIKE ${'%' + body.name + '%'}` : sql``}
      ${body.name ? sql`OR atention ILIKE ${'%' + body.name + '%'}` : sql``}
      order by name asc limit 150`;
    return suppliers;
  }

  async createSupplier(body: z.infer<typeof createSchema>) {
    await sql`insert into purchasesuppliers ${sql(body)}`;
    return;
  }

  async editSupplier(body: z.infer<typeof editSchema>) {
    await sql`update purchasesuppliers set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteSupplier(body: z.infer<typeof deleteSchema>) {
    await sql`delete from purchasesuppliers where id = ${body.id}`;

    return;
  }
}
