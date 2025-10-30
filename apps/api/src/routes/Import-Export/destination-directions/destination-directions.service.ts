import { Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  createDestinationDirectionSchema,
  editDestinationDirectionSchema,
  searchDestinationDirectionSchema,
} from './destination-directions.schema';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class DestinationDirectionsService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof searchDestinationDirectionSchema>) {
    const destinationDirections = await sql`
      SELECT *
      FROM "destinationDirections"
      WHERE 
      ${body.name ? sql`name ILIKE ${'%' + body.name + '%'}` : sql`TRUE`}
      ORDER BY id DESC limit 150`;

    return destinationDirections;
  }

  async update(body: z.infer<typeof editDestinationDirectionSchema>) {
    await sql.begin(async (sql) => {
      await sql`update "destinationDirections" set ${sql(body)} where id = ${body.id}`;
      await this.req.record(
        `Actualizo la dirección de destino ${body.name}`,
        sql,
      );
    });
    return;
  }

  async post(body: z.infer<typeof createDestinationDirectionSchema>) {
    await sql.begin(async (sql) => {
      await sql`insert into "destinationDirections" ${sql(body)}`;
      await this.req.record(
        `Registro la dirección de destino ${body.name}`,
        sql,
      );
    });
    return;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    await sql.begin(async (sql) => {
      const [deleted] =
        await sql`delete from "destinationDirections" where id = ${body.id} returning name`;
      await this.req.record(
        `Elimino la dirección de destino ${deleted.name}`,
        sql,
      );
    });
    return;
  }
}
