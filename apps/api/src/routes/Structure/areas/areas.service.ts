import { HttpException, Injectable } from '@nestjs/common';
import { deleteSchema, editSchema, createSchema } from './areas.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class AreasService {
  async findAllAreas() {
    const areas = await sql`Select * from areas order by name asc`;
    return areas;
  }

  async createArea(body: z.infer<typeof createSchema>) {
    await sql`insert into areas ${sql(body)}`;
    return;
  }

  async editArea(body: z.infer<typeof editSchema>) {
    if (!body.captured) {
      const [employee] =
        await sql`select * from employees where "areaId" = ${body.id}`;
      if (employee) {
        throw new HttpException(
          'No se puede desactivar una area con empleados',
          400,
        );
      }
    }
    await sql`update areas set ${sql(body)} where id = ${body.id}`;
    return;
  }

  async deleteArea(body: z.infer<typeof deleteSchema>) {
    await sql`delete from areas where id = ${body.id}`;

    return;
  }
}
