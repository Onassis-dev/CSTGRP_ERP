import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { filtersSchema } from './records.schema';
import { z } from 'zod/v4';

@Injectable()
export class RecordsService {
  async getRecords(query: z.infer<typeof filtersSchema>) {
    const records = await sql`
      SELECT created_at, text, "user", action 
      FROM records
      WHERE module = ${query.module}
      ${query.text ? sql`AND "text" ILIKE ${'%' + query.text + '%'}` : sql``}
      ${query.user ? sql`AND "user" ILIKE ${'%' + query.user + '%'}` : sql``}
      ORDER BY id DESC
      LIMIT 500
    `;

    return records;
  }
}
