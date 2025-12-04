import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './maintenances.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class MaintenancesService {
  async getOne(body: z.infer<typeof idObjectSchema>) {
    const rows =
      await sql`Select * from machine_maintenances where "machineId" = ${body.id} order by "date" desc`;
    return rows;
  }

  async create(body: z.infer<typeof createSchema>) {
    await sql`insert into machine_maintenances ${sql(body)}`;
  }

  async edit(body: z.infer<typeof editSchema>) {
    await sql`update machine_maintenances set ${sql(body)} where id = ${body.id}`;
  }

  async delete(body: z.infer<typeof deleteSchema>) {
    await sql`delete from machine_maintenances where id = ${body.id}`;
  }
}
