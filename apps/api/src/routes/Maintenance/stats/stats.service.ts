import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';

@Injectable()
export class StatsService {
  async get() {
    const [{ total }] = await sql`Select count(*) as total from machines`;
    const [{ active }] =
      await sql`Select count(*) as active from machines where active`;

    return { total, active };
  }
}
