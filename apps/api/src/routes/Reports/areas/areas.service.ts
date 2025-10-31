import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import { getAreasSchema, getDayDataSchema } from './areas.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { getWeekDays } from 'src/utils/functions';

@Injectable()
export class AreasService {
  constructor(private readonly req: ContextProvider) {}

  async getAreas(body: z.infer<typeof getAreasSchema>) {
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
        select SUM(ordermovements.produccion * ("produccionTime" / amount)) as prod from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${mondayDate} and ordermovements."produccion" is not null`;
      const [{ prod: tuesdayProd }] = await sql`
        select SUM(ordermovements.produccion * ("produccionTime" / amount)) as prod from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 1)} and ordermovements."produccion" is not null`;

      const [{ prod: wednesdayProd }] = await sql`
        select SUM(ordermovements.produccion * ("produccionTime" / amount)) as prod from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 2)} and ordermovements."produccion" is not null`;

      const [{ prod: thursdayProd }] = await sql`
        select SUM(ordermovements.produccion * ("produccionTime" / amount)) as prod from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 3)} and ordermovements."produccion" is not null`;

      const [{ prod: fridayProd }] = await sql`
        select SUM(ordermovements.produccion * ("produccionTime" / amount)) as prod from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 4)} and ordermovements."produccion" is not null`;

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
    select ordermovements.produccion, materialie.jobpo, (ordermovements.produccion * ("produccionTime" / amount)) as "workedMinutes"
    from ordermovements
    join orders on orders.id = ordermovements."progressId"
    join materialie on materialie.id = orders."jobId"
    where "areaId" = ${body.areaId} and "date" = ${date} 
    and ordermovements."produccion" is not null`;

    return { date, produced, minutes: day?.minutes };
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
