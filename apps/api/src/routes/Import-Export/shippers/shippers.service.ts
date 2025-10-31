import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  createShipperSchema,
  editShipperSchema,
  searchShipperSchema,
} from './shippers.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class ShippersService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof searchShipperSchema>) {
    const shippers = await sql`
      SELECT *
      FROM "shippers"
      WHERE 
      ${body.name ? sql`name ILIKE ${'%' + body.name + '%'}` : sql`TRUE`}
      ORDER BY id DESC limit 150`;

    return shippers;
  }

  async update(body: z.infer<typeof editShipperSchema>) {
    await sql.begin(async (sql) => {
      await sql`update "shippers" set ${sql(body)} where id = ${body.id}`;
      await this.req.record(`Actualizo el Transporte ${body.name}`, sql);
    });
    return;
  }

  async post(body: z.infer<typeof createShipperSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into "shippers" ${sql(body)}`;
      await this.req.record(`Registro el Transporte ${body.name}`, sql);
    });
    return;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [deleted] =
        await sql`delete from "shippers" where id = ${body.id} returning name`;
      await this.req.record(`Elimino el Transporte ${deleted.name}`, sql);
    });
    return;
  }
}
