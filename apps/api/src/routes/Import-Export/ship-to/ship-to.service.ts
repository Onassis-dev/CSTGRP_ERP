import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  createShipToSchema,
  editShipToSchema,
  searchShipToSchema,
} from './ship-to.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class ShipToService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof searchShipToSchema>) {
    const shipTo = await sql`
      SELECT *
      FROM "shipTo"
      WHERE 
      ${body.name ? sql`name ILIKE ${'%' + body.name + '%'}` : sql`TRUE`}
      ORDER BY id DESC limit 150`;

    return shipTo;
  }

  async update(body: z.infer<typeof editShipToSchema>) {
    await sql.begin(async (sql) => {
      await sql`update "shipTo" set ${sql(body)} where id = ${body.id}`;
      await this.req.record(
        `Actualizo el ship to ${body.name}`,
        sql,
      );
    });
    return;
  }

  async post(body: z.infer<typeof createShipToSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into "shipTo" ${sql(body)}`;
      await this.req.record(
        `Registro el ship to ${body.name}`,
        sql,
      );
    });
    return;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [deleted] =
        await sql`delete from "shipTo" where id = ${body.id} returning name`;
      await this.req.record(
        `Elimino el ship to ${deleted.name}`,
        sql,
      );
    });
    return;
  }
}

