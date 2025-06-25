import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './emails.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class EmailsService {
  async findAllEmails() {
    const emails = await sql`Select * from emails order by email asc`;
    return emails;
  }

  async createEmail(body: z.infer<typeof createSchema>) {
    await sql`insert into emails ${sql(body)}`;
    return;
  }

  async editEmail(body: z.infer<typeof editSchema>) {
    await sql`update emails set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteEmail(body: z.infer<typeof deleteSchema>) {
    await sql`delete from emails where id = ${body.id}`;

    return;
  }
}
