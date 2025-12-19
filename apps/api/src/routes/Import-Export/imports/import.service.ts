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
      FROM imports
      WHERE TRUE
      ${body.location ? sql`AND location = ${body.location}` : sql``}
      ${body.code ? sql`AND ref ILIKE ${'%' + body.code + '%'}` : sql``}
      ORDER BY due DESC, ref DESC limit 150`;

    return movements;
  }

  async getOne(body: z.infer<typeof idObjectSchema>) {
    const [data] = await sql`select * from imports where id = ${body.id}`;
    const materials =
      await sql`select (select code from materials where id = "materialId"), amount, "realAmount", active from materialmovements where "importId" = ${body.id}`;
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
        active: body.location === 'At CST, Qtys verified',
        materialId: material.id,
        importId: body.id,
        activeDate: body.due,
      });
    }

    delete body.materials;

    await sql.begin(async (sql) => {
      const previousObj = (
        await sql`select ref, location from imports where id = ${body.id}`
      )[0];

      const newObj = (
        await sql`update imports set ${sql(body)} where id = ${body.id} returning ref, location`
      )[0];

      const prevMaterials =
        await sql`delete from materialmovements where "importId" = ${body.id} returning "materialId"`;

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
        `Actualizo la importacion: ${previousObj?.ref} con status: ${previousObj?.location} a ${newObj?.ref}, ${newObj?.location}`,
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

      await sql`insert into imports (ref, due, location) values (${body.ref},${body.due}, ${body.location})`;

      await this.req.record(`Registro la importación: ${body.ref}`, sql);

      for (const material of body.materials) {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "importId", amount, "realAmount", active, "activeDate") values
         ((select id from materials where code = ${material.code}),(select id from imports where ref = ${body.ref}), ${Math.abs(parseFloat(material.amount))},${Math.abs(parseFloat(material.amount))}, ${body.location === 'At CST, Qtys verified'}, ${body.due}) returning "materialId"`;

        await updateMaterialAmount(movement.materialId, sql);
      }
    });
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.imports < 3) throw new HttpException('', 403);

    const movements =
      await sql`select "materialId" from materialmovements where "importId" = ${body.id}`;

    await sql.begin(async (sql) => {
      const deleted = (
        await sql`delete from imports where id = ${body.id} returning ref`
      )[0];

      for (const movement of movements) {
        await updateMaterialAmount(movement.materialId, sql);
      }

      await this.req.record(`Elimino la importacion ${deleted?.ref}`, sql);
    });

    return;
  }
}
