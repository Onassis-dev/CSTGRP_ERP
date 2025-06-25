import { Injectable } from '@nestjs/common';
import {
  deleteSchema,
  editSchema,
  createSchema,
  getDocSchema,
} from './docs.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class DocsService {
  async findAllDocs() {
    return await sql`Select * from docs order by page`;
  }

  async createDoc(body: z.infer<typeof createSchema>) {
    await sql`insert into docs ${sql(body)}`;
  }

  async editDoc(body: z.infer<typeof editSchema>) {
    await sql`update docs set ${sql(body)} where id = ${body.id}`;
  }

  async deleteDoc(body: z.infer<typeof deleteSchema>) {
    await sql`delete from docs where id = ${body.id}`;
  }

  async getDoc(body: z.infer<typeof getDocSchema>) {
    return (await sql`Select doc from docs where page = ${body.page}`)[0]?.doc;
  }
}
