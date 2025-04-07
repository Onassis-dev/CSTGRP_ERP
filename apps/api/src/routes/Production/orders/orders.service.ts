import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import sql from 'src/utils/db';
import { idSchema, filterSchema, progressSchema } from './orders.schema';
import exceljs from 'exceljs';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof filterSchema>) {
    const movements = await sql`
    SELECT orders.*, materialie.jobpo, materialie.programation, materialie."clientId"
    FROM orders
    join materialie on materialie.id = orders."jobId"`;

    return movements;
  }

  async getOne(body: z.infer<typeof idSchema>) {
    const [data] = await sql`
    SELECT orders.*, materialie.jobpo, materialie.programation, materialie."clientId"
    FROM orders
    join materialie on materialie.id = orders."jobId"
    where orders.id = ${body.id}`;

    const movements =
      await sql`select * from ordermovements where "progressId" = ${body.id}`;

    return {
      ...data,
      endDate: data.endDate.toISOString().split('T')[0],
      movements,
    };
  }

  async postProgress(body: z.infer<typeof progressSchema>) {
    const [order] =
      await sql`select * from orders where id = ${body.progressId}`;

    checkAmount(order, body, 'corte');
    checkAmount(order, body, 'cortesVarios');
    checkAmount(order, body, 'produccion');
    checkAmount(order, body, 'serigrafia');
    checkAmount(order, body, 'calidad');
    checkAmount(order, body, 'exportacion');

    await sql.begin(async (sql) => {
      await sql`insert into ordermovements ${sql(body)}`;
      await sql`update orders set 
      "corte" = (select COALESCE(sum("corte"), 0) from ordermovements where "progressId" = ${body.progressId}),
      "cortesVarios" = (select COALESCE(sum("cortesVarios"), 0) from ordermovements where "progressId" = ${body.progressId}),
      "produccion" = (select COALESCE(sum("produccion"), 0) from ordermovements where "progressId" = ${body.progressId}),
      "serigrafia" = (select COALESCE(sum("serigrafia"), 0) from ordermovements where "progressId" = ${body.progressId}),
      "calidad" = (select COALESCE(sum("calidad"), 0) from ordermovements where "progressId" = ${body.progressId}),
      "exportacion" = (select COALESCE(sum("exportacion"), 0) from ordermovements where "progressId" = ${body.progressId})
      
      where id = ${body.progressId}`;
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

function checkAmount(order: any, body: any, key: string) {
  if (!body[key]) return;
  if (Number(order[key]) + Number(body[key]) > Number(order.amount))
    throw new HttpException('Cantidad excedida', 400);
}
