import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getSchema,
} from './contractorsPrices.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class ContractorsPricesService {
  async findAll(body: z.infer<typeof getSchema>) {
    const contractors =
      await sql`Select * from contractor_prices where "contractorId" = ${body.contractorId} order by part desc`;
    return contractors;
  }

  async create(body: z.infer<typeof createSchema>) {
    await sql`insert into contractor_prices ${sql(body)}`;
    return;
  }

  async edit(body: z.infer<typeof editSchema>) {
    await sql`update contractor_prices set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async delete(body: z.infer<typeof deleteSchema>) {
    await sql`delete from contractor_prices where id = ${body.id}`;

    return;
  }
}
