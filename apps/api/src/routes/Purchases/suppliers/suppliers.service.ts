import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './suppliers.schema';
import { z } from 'zod';
import sql from 'src/utils/db';

@Injectable()
export class SuppliersService {
  async findAllSuppliers() {
    const suppliers =
      await sql`Select * from purchasesuppliers order by name asc`;
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
