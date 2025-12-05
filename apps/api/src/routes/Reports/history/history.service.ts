import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import { getWeekDays } from 'src/utils/functions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class HistoryService {
  constructor(private readonly req: ContextProvider) {}

  async get() {
    // const [mondayDate] = getWeekDays(new Date().toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];
    let weeks = [];

    for (let i = 0; i < 10; i++) {
      const [mondayDate] = getWeekDays(removeDays(today, 7 * i));
      weeks.push(mondayDate);
    }

    weeks = weeks.map(async (mondayDate) => {
      let history: any[] = await sql`
    SELECT 
      a.id,
      a.name as area,
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
      AND a.id IN (33,34)
    GROUP BY a.id, a.name;
`;

      if (!history.length)
        history = await sql`
      SELECT 
        a.id,
        a.name as area,
        0 as "mondayMinutes",
        0 as "tuesdayMinutes",
        0 as "wednesdayMinutes",
        0 as "thursdayMinutes",
        0 as "fridayMinutes" FROM areas a WHERE a.id IN (33,34)`;

      for (const area of history) {
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

        area.data = [
          {
            value: ((mondayProd / area.mondayMinutes) * 100).toFixed(2),
            name: formatDate(mondayDate),
          },
          {
            value: ((tuesdayProd / area.tuesdayMinutes) * 100).toFixed(2),
            name: formatDate(addDays(mondayDate, 1)),
          },
          {
            value: ((wednesdayProd / area.wednesdayMinutes) * 100).toFixed(2),
            name: formatDate(addDays(mondayDate, 2)),
          },
          {
            value: ((thursdayProd / area.thursdayMinutes) * 100).toFixed(2),
            name: formatDate(addDays(mondayDate, 3)),
          },
          {
            value: ((fridayProd / area.fridayMinutes) * 100).toFixed(2),
            name: formatDate(addDays(mondayDate, 4)),
          },
        ];
      }

      return { mondayDate, history };
    });

    weeks = await Promise.all(weeks);

    const result = [
      { area: 'CSI CB', data: [] },
      { area: 'CSI CM', data: [] },
    ];

    for (const week of weeks) {
      for (const area of week.history) {
        result
          .find((r) => r.area === area.area)
          .data.push(...area.data.reverse());
      }
    }

    return result.map((r) => ({ area: r.area, data: r.data.reverse() }));
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function removeDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd/MM EEEE', { locale: es }).toUpperCase();
}
