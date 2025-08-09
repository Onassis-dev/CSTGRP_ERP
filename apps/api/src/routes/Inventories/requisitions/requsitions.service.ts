import { HttpException, Injectable } from '@nestjs/common';
import exceljs from 'exceljs';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import {
  jobsSchema,
  movementsFilterSchema,
  requisitionSchema,
  suppliesSchema,
} from './requsitions.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { PetitionsService } from '../petitions/petitions.service';
@Injectable()
export class RequisitionsService {
  constructor(
    private readonly req: ContextProvider,
    private readonly petitionsService: PetitionsService,
  ) {}

  async getMovements(body: z.infer<typeof movementsFilterSchema>) {
    const movements = await sql`SELECT
      materials.code, materials.description, materials.measurement, materials."clientId", materials."leftoverAmount", materials.amount as inventory, materialmovements.amount, materialmovements."realAmount", materialie.due, materialie.jobpo, materialie.programation
      FROM materialmovements
      JOIN materials on materials.id = materialmovements."materialId"
      JOIN materialie on materialie.id = materialmovements."movementId"
      JOIN orders on orders."jobId" = materialie.id
      WHERE
      NOT materialmovements.active AND
      NOT materialmovements.extra AND
      (select STRING_AGG(folio::text, ', ') from requisitions where jobs LIKE CONCAT('%', materialie.jobpo, '%') and materialie.jobpo is not null and requisitions."materialId" = materials.id) is null AND
      ${body.jobpo ? sql`materialie.jobpo = ${body.jobpo}` : sql`TRUE`} AND
      ${body.programation ? sql`materialie.programation = ${body.programation}` : sql`TRUE`} AND
      ${body.code ? sql`materials.code LIKE ${'%' + body.code + '%'}` : sql`TRUE`} AND
      orders."areaId" IN (SELECT unnest(prod_areas) FROM users WHERE id = ${this.req.userId})
      ORDER BY materialie.due DESC, materialie.jobpo DESC, materials.code DESC, materialmovements.amount DESC, materialmovements.id DESC
      LIMIT 300`;
    return movements;
  }

  async getPendingJobs(body: z.infer<typeof jobsSchema>) {
    const movements = await sql`SELECT
      -materialmovements.amount as amount, materialie.due, materialie.jobpo, materialie.programation, materialmovements.id, false as selected
      FROM materialmovements
      JOIN materials on materials.id = materialmovements."materialId"
      JOIN materialie on materialie.id = materialmovements."movementId"
      JOIN orders on orders."jobId" = materialie.id
      WHERE
      materials.code = ${body.code} AND  
      orders."areaId" IN (SELECT unnest(prod_areas) FROM users WHERE id = ${this.req.userId}) AND
      (select folio from requisitions where jobs LIKE CONCAT('%', materialie.jobpo, '%') and materialie.jobpo is not null and requisitions."materialId" = materials.id) is null AND
      NOT materialmovements.active AND
      NOT materialmovements.extra
      ORDER BY materialie.due DESC, materialie.jobpo DESC LIMIT 20`;
    return movements;
  }

  async createRequisition(body: z.infer<typeof requisitionSchema>) {
    const [data] =
      await sql`SELECT COALESCE(STRING_AGG((SELECT jobpo FROM materialie WHERE id = "movementId"), ', ') || ',', '') as jobs,
        BOOL_OR((select folio from requisitions where jobs LIKE CONCAT('%', (select jobpo from materialie where id = materialmovements."movementId"), '%') and (select jobpo from materialie where id = materialmovements."movementId") is not null and requisitions."materialId" = (select "materialId" from materialmovements where id IN ${sql(body.jobIds)} limit 1)) is not null) as req,
        BOOL_OR(active) as active, SUM(amount) as necessary
        FROM materialmovements WHERE id IN ${sql(body.jobIds)}`;

    if (!data?.jobs) throw new HttpException('Selecciona al menos un job', 400);
    if (data?.active)
      throw new HttpException('Uno de los jobs ya fue expedido', 400);
    if (data?.req)
      throw new HttpException('Uno de los jobs ya tiene una requisicion', 400);

    const inserted = await sql.begin(async (sql) => {
      const [inserted] =
        await sql`insert into requisitions (folio, petitioner, "user", motive, area, "materialId", jobs, requested, necesary) values
        (
          (SELECT COALESCE(MAX(folio), 0) + 1 FROM requisitions),
          ${body.petitioner},
          (select username from users where id = ${this.req.userId}),
          ${body.motive},
          (select name from areas where id = ${body.areaId}),
          (select id from materials where code = ${body.code}),
          ${data.jobs},
          ${Math.abs(Number(body.requested))},
          ${Math.abs(Number(data.necessary))}
        ) returning id, folio`;

      await this.req.record(
        `Hizo una requisicion de folio: ${inserted.folio}`,
        sql,
      );
      return inserted;
    });

    return this.petitionsService.download({ id: inserted.id });
  }

  async createSupplyRequisition(body: z.infer<typeof suppliesSchema>) {
    await sql.begin(async (sql) => {
      for (const movement of body.materials) {
        const [material] =
          await sql`select id from materials where code = ${movement.code}`;
        if (!material) throw new HttpException('Material no existente', 400);

        const [inserted] =
          await sql`insert into requisitions (folio, petitioner, "user", motive, area, "materialId", jobs, requested, necesary) values
        (
          (SELECT COALESCE(MAX(folio), 0) + 1 FROM requisitions),
          ${body.petitioner},
          (select username from users where id = ${this.req.userId}),
          ${body.motive},
          (select name from areas where id = ${body.areaId}),
          ${material.id},
          ${body.job || ''},
          ${movement.amount},
          ${movement.amount}
        ) returning folio`;

        await this.req.record(
          `Hizo una requisicion de insumos de folio: ${inserted.folio}`,
          sql,
        );
      }
    });
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
      { header: 'Inventario', key: 'inventory', width: 20 },
      { header: 'En area', key: 'leftoverAmount', width: 20 },
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
