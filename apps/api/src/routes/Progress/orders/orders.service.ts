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
    select id, programation, ref, part, due, "clientId",
    "produccionTime" as time,
    "produccionTime" - (select SUM((operations.progress::float / amount::float) * operations.minutes) from operations where "orderId" = jobs.id AND operations.area = 'produccion') as missing
    from jobs
    WHERE
      ${body.jobpo ? sql`ref LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`"clientId" = ${body.clientId}` : sql`TRUE`} AND
      ${body.status === 'completed' ? sql`` : sql`NOT`}
       (
        NOT EXISTS (
          SELECT 1 FROM operations 
          WHERE "orderId" = jobs.id 
          AND progress != jobs.amount
        )
      )
      AND part is not null
      AND EXISTS (SELECT 1 FROM operations WHERE "orderId" = jobs.id)

    order by due desc, ref desc limit 150
    `;
    return orders;
  }

  async getOrder(params: z.infer<typeof idObjectSchema>) {
    const [order] = await sql`
      select jobs.id, part, amount, ref,
      (select json_agg(operations order by id desc) from operations where "orderId" = jobs.id) as operations
      from jobs
      left join operations on operations."orderId" = jobs.id
      where jobs.id = ${params.id}`;
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
        select COALESCE(SUM((progressmovements.added::float / jobs.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join jobs on jobs.id = operations."orderId" WHERE progressmovements.date = ${mondayDate} AND operations.area = 'produccion' AND jobs."areaId" = ${area.id}`;
      const [{ prod: tuesdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / jobs.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join jobs on jobs.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 1)} AND operations.area = 'produccion' AND jobs."areaId" = ${area.id}`;
      const [{ prod: wednesdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / jobs.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join jobs on jobs.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 2)} AND operations.area = 'produccion' AND jobs."areaId" = ${area.id}`;
      const [{ prod: thursdayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / jobs.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join jobs on jobs.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 3)} AND operations.area = 'produccion' AND jobs."areaId" = ${area.id}`;
      const [{ prod: fridayProd }] = await sql`
        select COALESCE(SUM((progressmovements.added::float / jobs.amount::float) * operations.minutes), 0) as prod from progressmovements join operations on operations.id = progressmovements."operationId" join jobs on jobs.id = operations."orderId" WHERE progressmovements.date = ${addDays(mondayDate, 4)} AND operations.area = 'produccion' AND jobs."areaId" = ${area.id}`;

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
    select progressmovements.added, operations.code, jobs.ref, (progressmovements.added * (operations.minutes / jobs.amount)) as "workedMinutes"
    from progressmovements
    join operations on operations.id = progressmovements."operationId"
    join jobs on jobs.id = operations."orderId"
    where jobs."areaId" = ${body.areaId} and "date" = ${date}`;

    return { date, produced, minutes: day?.minutes };
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
