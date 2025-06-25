import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './directory.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class DirectoryService {
  async findAllDirectory() {
    const directory =
      await sql`Select *, (select email from emails where id = directory."emailId") from directory order by name`;
    return directory;
  }

  async createEmail(body: z.infer<typeof createSchema>) {
    await sql`insert into directory ${sql(body)}`;
    return;
  }

  async editEmail(body: z.infer<typeof editSchema>) {
    await sql`update directory set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteEmail(body: z.infer<typeof deleteSchema>) {
    await sql`delete from directory where id = ${body.id}`;

    return;
  }

  async getOptions() {
    const emails =
      await sql`select id as value, email as name from emails order by email`;
    const employees =
      await sql`select id as value, concat(name, ' ', "paternalLastName", ' ', "maternalLastName") as name from employees order by name`;

    return { emails, employees };
  }
}
