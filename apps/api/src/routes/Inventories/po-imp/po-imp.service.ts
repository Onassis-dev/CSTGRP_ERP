import { HttpException, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import sql from 'src/utils/db';
import {
  exportSchema,
  idSchema,
  IEFilterSchema,
  importSchema,
  updateExportSchema,
  updateImportSchema,
} from './po-imp.schema';
import { updateMaterialAmount } from 'src/utils/functions';
import exceljs from 'exceljs';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class PoImpService {
  constructor(private readonly req: ContextProvider) {}

  async getIE(body: z.infer<typeof IEFilterSchema>) {
    const movements = await sql`
      SELECT * 
      FROM materialie
      WHERE 
      ${
        body.type === 'imports'
          ? sql`"import" IS NOT NULL`
          : body.type === 'exports'
            ? sql`"jobpo" IS NOT NULL`
            : sql`TRUE`
      }
      ${
        body.code
          ? sql`AND (
          "import" ILIKE ${'%' + body.code + '%'} OR 
          "jobpo" ILIKE ${'%' + body.code + '%'} OR 
          "programation" ILIKE ${'%' + body.code + '%'}
          )`
          : sql``
      }
      AND due <> '2024-01-01' AND due <> '2024-01-02'
      ORDER BY due DESC, jobpo DESC, import DESC`;

    return movements;
  }

  async getOneIE(body: z.infer<typeof idSchema>) {
    const [data] = await sql`select * from materialie where id = ${body.id}`;
    const materials =
      await sql`select (select code from materials where id = "materialId"), amount, "realAmount", active from materialmovements where "movementId" = ${body.id} and NOT extra`;

    return { ...data, due: data.due.toISOString().split('T')[0], materials };
  }

  async getJobComparison(body: z.infer<typeof idSchema>) {
    const movements = await sql`SELECT
    materials.code,
    materials.measurement,
    materialmovements.amount,
    (
        SELECT SUM(amount) 
        FROM materialmovements AS m
        WHERE m."materialId" = materialmovements."materialId" AND m."movementId" = materialmovements."movementId"
    ) AS "realAmount"
        FROM
        materialmovements
    JOIN
        materials ON materials.id = materialmovements."materialId"
    JOIN
        materialie ON materialie.id = materialmovements."movementId"
    WHERE
        materialmovements."movementId" = ${body.id} AND materialmovements.active IS true
        AND materialmovements.extra = false
    ORDER BY
        materialmovements.id DESC;`;

    return movements;
  }

  async updateImport(body: z.infer<typeof updateImportSchema>, token: string) {
    const user: any = await jwt.verify(token, process.env.JWT_SECRET);
    if (user.username !== 'juan' && user.username !== 'admin')
      throw new HttpException(
        'No tienes permisos para eliminar movimientos',
        403,
      );

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

  async updateExport(body: z.infer<typeof updateExportSchema>, token: string) {
    const user: any = await jwt.verify(token, process.env.JWT_SECRET);
    if (user.username !== 'juan' && user.username !== 'admin')
      throw new HttpException(
        'No tienes permisos para eliminar movimientos',
        403,
      );

    const materials = [];
    for (const movement of body.materials) {
      const [material] =
        await sql`select id from materials where code = ${movement.code}`;

      if (!material) throw new HttpException('Material no existente', 400);

      materials.push({
        amount: -Math.abs(parseFloat(movement.amount)),
        realAmount: -Math.abs(parseFloat(movement.realAmount)),
        active: movement.active,
        materialId: material.id,
        movementId: body.id,
        activeDate: movement.active ? new Date() : null,
      });
    }

    delete body.materials;

    await sql.begin(async (sql) => {
      const previousObj = (
        await sql`select jobpo, programation from materialie where id = ${body.id}`
      )[0];

      const newObj = (
        await sql`update materialie set ${sql(body)} where id = ${body.id} returning jobpo, programation`
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
        `Actualizo la exportacion: ${previousObj?.jobpo}, programacion: ${previousObj?.programation} a ${newObj?.jobpo}, ${newObj?.programation}`,
        sql,
      );
    });

    return;
  }

  async activateMovement(body: z.infer<typeof idSchema>) {
    const [movement] =
      await sql`select active, (select code from materials where id = "materialId"), (select jobpo from materialie where id = "movementId") from materialmovements where id = ${body.id}`;

    await sql.begin(async (sql) => {
      const [result] =
        await sql`UPDATE materialmovements SET active = NOT active, "activeDate" = ${movement.active ? null : new Date()} WHERE id = ${body.id} returning "materialId", "realAmount"`;

      await updateMaterialAmount(result.materialId, sql);

      await this.req.record(
        movement.active
          ? `Desactivo el movimiento del job ${movement.jobpo} y ${result.realAmount} ${movement.code}`
          : `Activo el movimiento del job ${movement.jobpo} y ${result.realAmount} ${movement.code}`,
        sql,
      );
    });

    return movement.active;
  }

  async postInput(body: z.infer<typeof importSchema>) {
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

  async postExport(body: z.infer<typeof exportSchema>) {
    const materials = body.materials.map((item: any) => item.code);

    const materialRows =
      await sql`SELECT code FROM materials WHERE code in ${sql(materials)}`;
    if (materialRows.length !== materials.length)
      throw new HttpException(
        'Uno o varios de los materiales incorrectos',
        400,
      );

    console.log(body);
    await sql.begin(async (sql) => {
      await sql`Select id from materials where code in (${materials})`;

      const [movement] =
        await sql`Insert into materialie (jobpo, programation, due, "clientId") values (${body.jobpo}, ${body.programation}, ${body.due}, ${body.clientId}) returning id`;

      await this.req.record(`Registro el job: ${body.jobpo}`, sql);

      for (const material of body.materials) {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
         ((select Id from materials where code = ${material.code}),(select id from materialie where jobpo = ${body.jobpo}),${-Math.abs(parseFloat(material.amount))},${-Math.abs(parseFloat(material.realAmount))}, ${material.active}, ${material.active ? new Date() : null}) returning "materialId"`;

        if (material.active)
          await updateMaterialAmount(movement.materialId, sql);
      }

      await sql`insert into orders (part, amount, "endDate", "jobId") values (${body.part}, ${body.amount}, ${body.endDate}, ${movement.id})`;
    });

    return;
  }

  async deleteIE(body: z.infer<typeof idSchema>, token: string) {
    const user: any = await jwt.verify(token, process.env.JWT_SECRET);
    if (user.username !== 'juan' && user.username !== 'admin')
      throw new HttpException(
        'No tienes permisos para eliminar movimientos',
        403,
      );

    const movements =
      await sql`select "materialId" from materialmovements where "movementId" = ${body.id}`;

    await sql.begin(async (sql) => {
      const deleted = (
        await sql`delete from materialie where id = ${body.id} returning jobpo, import`
      )[0];

      for (const movement of movements) {
        await updateMaterialAmount(movement.materialId, sql);
      }

      await this.req.record(
        `Elimino ${deleted?.jobpo ? 'el job' : 'la importacion'} ${deleted?.jobpo || deleted?.import}`,
        sql,
      );
    });

    return;
  }

  async exportPending() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    const results = await sql`SELECT
      materials.code, materials.description, materials.measurement, materials."clientId", materials."leftoverAmount", materials.amount as inventory, materialmovements.amount, materialmovements."realAmount", materialmovements.id, materialie.due, materialie.jobpo, materialie.programation
      FROM materialmovements
      JOIN materials on materials.id = materialmovements."materialId"
      JOIN materialie on materialie.id = materialmovements."movementId"
      WHERE materialmovements.active = false
      ORDER BY materialie.due DESC, materialie.jobpo DESC, materials.code DESC, materialmovements.amount DESC, materialmovements.id DESC`;

    worksheet.columns = [
      { header: 'Programacion', key: 'programation', width: 16 },
      { header: 'Job', key: 'jobpo', width: 12 },
      { header: 'Material', key: 'code', width: 22 },
      { header: 'Descripcion', key: 'description', width: 22 },
      { header: 'Cantidad', key: 'amount', width: 15 },
      { header: 'Cantidad Real', key: 'realAmount', width: 15 },
      { header: 'Inventario', key: 'inventory', width: 20 },
      { header: 'Sobrante en area', key: 'leftoverAmount', width: 20 },
      { header: 'Medida', key: 'measurement', width: 14 },
    ];

    worksheet.addRows(results);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
