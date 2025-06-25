import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './computers.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class ComputersService {
  async findAllComputers() {
    const computers = await sql`Select * from computers order by name asc`;
    return computers;
  }

  async createComputer(body: z.infer<typeof createSchema>) {
    await sql`insert into computers ${sql(body)}`;
    return;
  }

  async editComputer(body: z.infer<typeof editSchema>) {
    await sql`update computers set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteComputer(body: z.infer<typeof deleteSchema>) {
    await sql`delete from computers where id = ${body.id}`;

    return;
  }
}
