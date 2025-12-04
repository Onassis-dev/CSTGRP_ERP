import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getMachinesSchema,
} from './machines.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class MachinesService {
  async findAll(query: z.infer<typeof getMachinesSchema>) {
    const rows =
      await sql`Select *, active::text from machines where active = ${query.active} order by "publicId" asc`;
    return rows;
  }

  async create(body: z.infer<typeof createSchema>) {
    await sql`insert into machines ${sql(body)}`;
  }

  async edit(body: z.infer<typeof editSchema>) {
    await sql`update machines set ${sql(body)} where id = ${body.id}`;
  }

  async delete(body: z.infer<typeof deleteSchema>) {
    await sql`delete from machines where id = ${body.id}`;
  }
}
