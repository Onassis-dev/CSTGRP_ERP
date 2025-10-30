import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  createCarrierSchema,
  editCarrierSchema,
  searchCarrierSchema,
} from './carriers.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class CarriersService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof searchCarrierSchema>) {
    const carriers = await sql`
      SELECT *
      FROM carriers
      WHERE 
      ${body.name ? sql`name ILIKE ${'%' + body.name + '%'}` : sql`TRUE`}
      ORDER BY id DESC limit 150`;

    return carriers;
  }

  async update(body: z.infer<typeof editCarrierSchema>) {
    await sql.begin(async (sql) => {
      await sql`update carriers set ${sql(body)} where id = ${body.id}`;
      await this.req.record(`Actualizo el transportista ${body.name}`, sql);
    });
    return;
  }

  async post(body: z.infer<typeof createCarrierSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into carriers ${sql(body)}`;
      await this.req.record(`Registro el transportista ${body.name}`, sql);
    });
    return;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [deleted] =
        await sql`delete from carriers where id = ${body.id} returning name`;
      await this.req.record(`Elimino el transportista ${deleted.name}`, sql);
    });
    return;
  }
}
