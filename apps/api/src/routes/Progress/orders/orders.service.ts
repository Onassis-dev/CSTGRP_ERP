import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  getDayDataSchema,
  getOrdersSchema,
  getReportSchema,
} from './orders.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';
import { getWeekDays } from 'src/utils/functions';

@Injectable()
export class OrdersService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getOrdersSchema>) {
    const orders = await sql`
    select orders.id, materialie.programation, materialie.jobpo, orders.part, materialie."due", materialie."clientId",
    "produccionTime" as time,
    "produccionTime" - (select SUM((operations.progress::float / orders.amount::float) * operations.minutes) from operations where "orderId" = orders.id AND operations.area = 'produccion') as missing
    from orders
    join materialie on materialie.id = orders."jobId"
    WHERE
      ${body.jobpo ? sql`materialie.jobpo LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`materialie.programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`materialie."clientId" = ${body.clientId}` : sql`TRUE`} AND
      ${body.status === 'completed' ? sql`` : sql`NOT`}
       (
        NOT EXISTS (SELECT 1 FROM operations WHERE "orderId" = orders.id)
        OR
        NOT EXISTS (
          SELECT 1 FROM operations 
          WHERE "orderId" = orders.id 
          AND progress != orders.amount
        )
      )
    order by materialie."due" desc, materialie.jobpo desc limit 150
    `;
    return orders;
  }

  async getOrder(params: z.infer<typeof idObjectSchema>) {
    const [order] = await sql`
      select orders.id, orders.part, orders.amount, materialie.jobpo,
      (select json_agg(operations order by id desc) from operations where "orderId" = orders.id) as operations
      from orders
      left join operations on operations."orderId" = orders.id
      left join materialie on materialie.id = orders."jobId"
      where orders.id = ${params.id}`;
    return order;
  }

  async getReport(body: z.infer<typeof getReportSchema>) {
    const [mondayDate] = getWeekDays(body.date);

    const areas: any[] = await sql`
    SELECT 
      a.id,
      a.name,
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND s."areaId0" IS NULL) OR s."areaId0" = a.id
          THEN COALESCE(s.hours0,0) ELSE 0
        END
      ) AS "mondayMinutes",
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND s."areaId1" IS NULL) OR s."areaId1" = a.id
          THEN COALESCE(s.hours1,0) ELSE 0
        END
      ) AS "tuesdayMinutes",
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND s."areaId2" IS NULL) OR s."areaId2" = a.id
          THEN COALESCE(s.hours2,0) ELSE 0
        END
      ) AS "wednesdayMinutes",
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND s."areaId3" IS NULL) OR s."areaId3" = a.id
          THEN COALESCE(s.hours3,0) ELSE 0
        END
      ) AS "thursdayMinutes",
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND s."areaId4" IS NULL) OR s."areaId4" = a.id
          THEN COALESCE(s.hours4,0) ELSE 0
        END
      ) AS "fridayMinutes"
    FROM assistance s
    JOIN areas a ON TRUE
    JOIN positions p ON (s."positionId" = p.id)
    WHERE s."mondayDate" = ${mondayDate}
      AND p.supervisor = false
    GROUP BY a.id, a.name;
`;

    for (const area of areas) {
      const [{ prod: mondayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / orders.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join orders on orders.id = operations."orderId" WHERE progressmovements.date = ${mondayDate} AND operations.area = 'produccion' AND orders."areaId" = ${area.id}`;
      const [{ prod: tuesdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / orders.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join orders on orders.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 1)} AND operations.area = 'produccion' AND orders."areaId" = ${area.id}`;
      const [{ prod: wednesdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / orders.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join orders on orders.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 2)} AND operations.area = 'produccion' AND orders."areaId" = ${area.id}`;
      const [{ prod: thursdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / orders.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join orders on orders.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 3)} AND operations.area = 'produccion' AND orders."areaId" = ${area.id}`;
      const [{ prod: fridayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / orders.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join orders on orders.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 4)} AND operations.area = 'produccion' AND orders."areaId" = ${area.id}`;

      area.mondayAvg = mondayProd / area.mondayMinutes;
      area.tuesdayAvg = tuesdayProd / area.tuesdayMinutes;
      area.wednesdayAvg = wednesdayProd / area.wednesdayMinutes;
      area.thursdayAvg = thursdayProd / area.thursdayMinutes;
      area.fridayAvg = fridayProd / area.fridayMinutes;
    }

    const result = areas.filter((area) => {
      const averages = [
        area.mondayAvg,
        area.tuesdayAvg,
        area.wednesdayAvg,
        area.thursdayAvg,
        area.fridayAvg,
      ];

      return !averages.every((avg) => isNaN(avg) || avg === 0);
    });

    if (result.length) console.log(result);

    return result;
  }

  async getDayData(body: z.infer<typeof getDayDataSchema>) {
    const [mondayDate] = getWeekDays(body.date);
    const date = addDays(mondayDate, body.day);

    const [day] = await sql`
      SELECT 
      SUM(
        CASE 
          WHEN (s."areaId" = a.id AND ${sql('areaId' + body.day)} IS NULL) OR ${sql('areaId' + body.day)} = a.id
          THEN COALESCE(s.${sql('hours' + body.day)},0) ELSE 0
        END
      ) AS "minutes"
    FROM assistance s
    JOIN areas a ON s."areaId" = a.id
    JOIN positions p ON (s."positionId" = p.id)
    WHERE s."mondayDate" = ${mondayDate}
      AND s."areaId" = ${body.areaId}
      AND p.supervisor = false
    GROUP BY a.id;`;

    const produced = await sql`
    select progressmovements.added, operations.code, materialie.jobpo, (progressmovements.added * (operations.minutes / orders.amount)) as "workedMinutes"
    from progressmovements
    join operations on operations.id = progressmovements."operationId"
    join orders on orders.id = operations."orderId"
    join materialie on materialie.id = orders."jobId"
    where "areaId" = ${body.areaId} and "date" = ${date}`;

    return { date, produced, minutes: day?.minutes };
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
