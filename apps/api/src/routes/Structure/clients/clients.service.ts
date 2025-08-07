import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './clients.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class ClientsService {
  async findAllClients() {
    const clients = await sql`Select * from clients order by name asc`;
    return clients;
  }

  async createClient(body: z.infer<typeof createSchema>) {
    await sql`insert into clients ${sql(body)}`;
    return;
  }

  async editClient(body: z.infer<typeof editSchema>) {
    await sql`update clients set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteClient(body: z.infer<typeof deleteSchema>) {
    await sql`delete from clients where id = ${body.id}`;

    return;
  }
}
