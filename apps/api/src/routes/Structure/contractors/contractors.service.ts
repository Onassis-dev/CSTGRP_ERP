import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './contractors.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class ContractorsService {
  async findAllContractors() {
    const contractors = await sql`Select * from contractors order by name asc`;
    return contractors;
  }

  async createContractor(body: z.infer<typeof createSchema>) {
    await sql`insert into contractors ${sql(body)}`;
    return;
  }

  async editContractor(body: z.infer<typeof editSchema>) {
    await sql`update contractors set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteContractor(body: z.infer<typeof deleteSchema>) {
    await sql`delete from contractors where id = ${body.id}`;

    return;
  }
}
