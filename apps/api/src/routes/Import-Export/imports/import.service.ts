import { HttpException, Injectable } from '@nestjs/common';
import { ContextProvider } from 'src/interceptors/context.provider';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  IEFilterSchema,
  importSchema,
  updateImportSchema,
} from './import.schema';
import { idObjectSchema } from 'src/utils/schemas';
import { updateMaterialAmount } from 'src/utils/functions';

@Injectable()
export class ImportService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof IEFilterSchema>) {
    const movements = await sql`
      SELECT *
      FROM materialie
      WHERE 
      "import" IS NOT NULL
      ${body.location ? sql`AND location = ${body.location}` : sql``}
      ${body.code ? sql`AND "import" ILIKE ${'%' + body.code + '%'}` : sql``}
      ORDER BY due DESC, import DESC limit 150`;

    return movements;
  }

  async getOne(body: z.infer<typeof idObjectSchema>) {
    const [data] = await sql`select * from materialie where id = ${body.id}`;
    const materials =
      await sql`select (select code from materials where id = "materialId"), amount, "realAmount", active from materialmovements where "movementId" = ${body.id} and NOT extra`;
    return {
      ...data,
      due: data.due.toISOString().split('T')[0],
      materials,
    };
  }

  async update(body: z.infer<typeof updateImportSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.imports < 3) throw new HttpException('', 403);

    const materials = [];
    for (const movement of body.materials) {
      const [material] =
        await sql`select id from materials where code = ${movement.code}`;

      if (!material) throw new HttpException('Material no existente', 400);

      materials.push({
        amount: Math.abs(parseFloat(movement.amount)),
        realAmount: Math.abs(parseFloat(movement.amount)),
        active: true,
        materialId: material.id,
        movementId: body.id,
        activeDate: body.due,
      });
    }

    delete body.materials;

    await sql.begin(async (sql) => {
      const previousObj = (
        await sql`select import, location from materialie where id = ${body.id}`
      )[0];

      const newObj = (
        await sql`update materialie set ${sql(body)} where id = ${body.id} returning import, location`
      )[0];

      const prevMaterials =
        await sql`delete from materialmovements where "movementId" = ${body.id} and not extra returning "materialId"`;

      const newMaterials =
        await sql`insert into materialmovements ${sql(materials)} returning "materialId"`;

      const filteredIds = [
        ...new Set(
          [...prevMaterials, ...newMaterials].map((v) => v.materialId),
        ),
      ];

      for (const id of filteredIds) {
        await updateMaterialAmount(id, sql);
      }

      await this.req.record(
        `Actualizo la importacion: ${previousObj?.import} con status: ${previousObj?.location} a ${newObj?.import}, ${newObj?.location}`,
        sql,
      );
    });

    return;
  }

  async post(body: z.infer<typeof importSchema>) {
    const materials = [
      ...new Set(body.materials.map((item: any) => item.code)),
    ];
    await sql.begin(async (sql) => {
      const materialRows =
        await sql`SELECT code FROM materials WHERE code in ${sql(materials)}`;

      if (materialRows.length !== materials.length)
        throw new HttpException(
          'Uno o varios de los materiales incorrectos',
          400,
        );

      await sql`insert into materialie (import, due, location) values (${body.import},${body.due}, ${body.location})`;

      await this.req.record(`Registro la importación: ${body.import}`, sql);

      for (const material of body.materials) {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
         ((select id from materials where code = ${material.code}),(select id from materialie where import = ${body.import}), ${Math.abs(parseFloat(material.amount))},${Math.abs(parseFloat(material.amount))}, true, ${body.due}) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);
      }
    });
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.imports < 3) throw new HttpException('', 403);

    const movements =
      await sql`select "materialId" from materialmovements where "movementId" = ${body.id}`;

    await sql.begin(async (sql) => {
      const deleted = (
        await sql`delete from materialie where id = ${body.id} and import IS NOT NULL returning import`
      )[0];

      for (const movement of movements) {
        await updateMaterialAmount(movement.materialId, sql);
      }

      await this.req.record(`Elimino la importacion ${deleted?.import}`, sql);
    });

    return;
  }
}
