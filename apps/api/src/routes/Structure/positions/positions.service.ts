import { Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './positions.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class PositionsService {
  async findAllPositions() {
    const positions = await sql`Select * from positions order by name asc`;
    return positions;
  }

  async createPosition(body: z.infer<typeof createSchema>) {
    await sql`insert into positions ${sql(body)}`;
    return;
  }

  async editPosition(body: z.infer<typeof editSchema>) {
    await sql`update positions set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deletePosition(body: z.infer<typeof deleteSchema>) {
    await sql`delete from positions where id = ${body.id}`;

    return;
  }
}
