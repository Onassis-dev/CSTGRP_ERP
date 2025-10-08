import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import {
  exportSchema,
  IEFilterSchema,
  updateExportSchema,
} from './jobs.schema';
import { updateMaterialAmount } from 'src/utils/functions';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';

@Injectable()
export class JobsService {
  constructor(private readonly req: ContextProvider) {}

  async get(body: z.infer<typeof IEFilterSchema>) {
    const movements = await sql`
      SELECT *
      FROM materialie
      WHERE 
      "jobpo" IS NOT NULL
      ${body.job ? sql`AND "jobpo" ILIKE ${'%' + body.job + '%'} ` : sql``}
      ${
        body.programation
          ? sql`AND "programation" = ${body.programation}`
          : sql``
      }
      ORDER BY due DESC, jobpo DESC limit 150`;

    return movements;
  }

  async getOne(body: z.infer<typeof idObjectSchema>) {
    const [data] = await sql`select * from materialie where id = ${body.id}`;
    const [order] = await sql`select * from orders where "jobId" = ${body.id}`;
    const [productMovement] =
      await sql`select "materialId" as "productId" from materialmovements where "id" = ${order?.movementId || null}`;
    const materials =
      await sql`select (select code from materials where id = "materialId"), amount, "realAmount", active from materialmovements where "movementId" = ${body.id} and NOT extra
      ${order?.movementId ? sql`and id <> ${order.movementId}` : sql``}`;

    const destinations =
      await sql`select destinys.id, so, po, amount, date, pallets
       from order_destiny 
       join destinys on destinys.id = order_destiny."destinyId"
       where "orderId" = (select id from orders where "jobId" = ${body.id})`;

    return {
      ...order,
      ...data,
      ...productMovement,
      due: data.due.toISOString().split('T')[0],
      materials,
      destinations: destinations.map((destination) => ({
        ...destination,
        date: destination.date.toISOString().split('T')[0],
      })),
    };
  }

  async getComparison(body: z.infer<typeof idObjectSchema>) {
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

  async post(body: z.infer<typeof exportSchema>) {
    const materials = body.materials.map((item: any) => item.code);
    if (body.productId) body.part = null;

    const materialRows =
      await sql`SELECT code FROM materials WHERE code in ${sql(materials)}`;
    if (materialRows.length !== materials.length)
      throw new HttpException(
        'Uno o varios de los materiales incorrectos',
        400,
      );

    await sql.begin(async (sql) => {
      // Add inventory info
      const [insertedJob] = await sql`Insert into materialie ${sql({
        jobpo: body.jobpo,
        programation: body.programation,
        due: body.due,
        clientId: body.clientId,
      })} returning id`;

      for (const material of body.materials) {
        const [movement] =
          await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
         ((select id from materials where code = ${material.code}), ${insertedJob.id} ,${-Math.abs(parseFloat(material.amount))}, ${-Math.abs(parseFloat(material.realAmount))}, ${material.active}, ${material.active ? new Date() : null})
         returning "materialId"`;

        if (material.active)
          await updateMaterialAmount(movement.materialId, sql);
      }

      //If there is a productId, create the movement
      let productMovement;
      if (body.productId) {
        [productMovement] = await sql`insert into materialmovements ${sql({
          materialId: body.productId,
          movementId: insertedJob.id,
          amount: 0,
          realAmount: 0,
          active: true,
          activeDate: new Date(),
        })} returning id as "movementId"`;
      }

      // Add production info
      const [order] = await sql`insert into orders ${sql({
        areaId: body.areaId,
        jobId: insertedJob.id,
        part: body.part,
        description: body.description,
        perBox: body.perBox,
        amount: body.amount,
        corteTime: body.corteTime,
        cortesVariosTime: body.cortesVariosTime,
        produccionTime: body.produccionTime,
        calidadTime: body.calidadTime,
        serigrafiaTime: body.serigrafiaTime,
        operations: body.operations,
        ...productMovement,
      })} returning id`;

      // Add destinations info
      if (body.destinations.length > 0) {
        await sql`insert into destinys ${sql(body.destinations, 'so')} on conflict ("so") do nothing`;

        for (const destination of body.destinations) {
          await sql`insert into order_destiny ("orderId", "destinyId", "amount", "date", "po") values
         (${order.id}, (select id from destinys where so = ${destination.so}), ${destination.amount}, ${destination.date}, ${destination.po})`;
        }
      }

      // Make record
      await this.req.record(`Registro el job: ${body.jobpo}`, sql);
    });

    return;
  }

  async update(body: z.infer<typeof updateExportSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.jobs < 3) throw new HttpException('', 403);

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

    await sql.begin(async (sql) => {
      // Add inventory info
      const previousObj = (
        await sql`select jobpo, programation from materialie where id = ${body.id}`
      )[0];

      const newObj = (
        await sql`update materialie set ${sql({
          due: body.due,
          jobpo: body.jobpo,
          programation: body.programation,
          clientId: body.clientId,
        })} where id = ${body.id} returning jobpo, programation`
      )[0];

      const prevMaterials =
        await sql`delete from materialmovements where "movementId" = ${body.id} 
        and not extra
        and id is distinct from (select "movementId" from orders where "jobId" = ${body.id})
        returning "materialId"`;

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

      // Add production info
      if (!body.part) throw new HttpException('Parte: requerida', 400);
      const [order] = await sql`update orders set ${sql({
        areaId: body.areaId,
        part: body.part,
        description: body.description,
        perBox: body.perBox,
        amount: body.amount,
        corteTime: body.corteTime,
        cortesVariosTime: body.cortesVariosTime,
        produccionTime: body.produccionTime,
        calidadTime: body.calidadTime,
        serigrafiaTime: body.serigrafiaTime,
        operations: body.operations,
      })} where "jobId" = ${body.id} returning id`;

      // Add destinations info
      if (body.destinations.length > 0) {
        await sql`insert into destinys ${sql(body.destinations, 'so')} on conflict ("so") do nothing`;
        await sql`delete from order_destiny where "orderId" = ${order.id}`;

        for (const destination of body.destinations) {
          await sql`insert into order_destiny ("orderId", "destinyId", "amount", "date", "po") values
          (${order.id}, (select id from destinys where so = ${destination.so}), ${destination.amount}, ${destination.date}, ${destination.po})`;
        }
      }

      // Make record
      await this.req.record(
        `Actualizo la exportacion: ${previousObj?.jobpo}, programacion: ${previousObj?.programation} a ${newObj?.jobpo}, ${newObj?.programation}`,
        sql,
      );
    });

    return;
  }

  async delete(body: z.infer<typeof idObjectSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.jobs < 3) throw new HttpException('', 403);

    const movements =
      await sql`select "materialId" from materialmovements where "movementId" = ${body.id}`;

    await sql.begin(async (sql) => {
      const deleted = (
        await sql`delete from materialie where id = ${body.id} and jobpo is not null returning jobpo`
      )[0];

      for (const movement of movements) {
        await updateMaterialAmount(movement.materialId, sql);
      }

      await this.req.record(`Elimino el job ${deleted?.jobpo}`, sql);
    });

    return;
  }
}
