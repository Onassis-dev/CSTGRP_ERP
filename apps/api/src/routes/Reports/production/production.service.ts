import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { z } from 'zod/v4';
import {
  checkOrderSchema,
  getAreasSchema,
  getOrdersSchema,
} from './production.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import { getWeekDays } from 'src/utils/functions';

@Injectable()
export class ProductionService {
  constructor(private readonly req: ContextProvider) {}

  async getOrders(body: z.infer<typeof getOrdersSchema>) {
    const orders = await sql`
    select orders.id, materialie.programation, materialie.jobpo, orders.part, materialie."due", materialie."clientId", orders.invoiced,
    ("corteTime" + "serigrafiaTime" + "produccionTime" + "calidadTime" + "cortesVariosTime") as "time"
    from orders
    join materialie on materialie.id = orders."jobId"
    WHERE
      ${body.jobpo ? sql`materialie.jobpo LIKE ${'%' + body.jobpo + '%'}` : sql`TRUE`} AND
      ${body.programation ? sql`materialie.programation LIKE ${'%' + body.programation + '%'}` : sql`TRUE`} AND
      ${body.clientId ? sql`materialie."clientId" = ${body.clientId}` : sql`TRUE`}
    order by materialie."due" desc, materialie.jobpo desc limit 150
    `;
    return orders;
  }

  async checkOrder(body: z.infer<typeof checkOrderSchema>) {
    await sql`update orders set invoiced = not invoiced where id = ${body.id}`;
  }

  async getAreas(body: z.infer<typeof getAreasSchema>) {
    const [mondayDate] = getWeekDays(body.date);

    const areas: any[] = await sql`
      SELECT 
        a.id,
        a.name,
        SUM(hours0) AS "mondayMinutes", 
        SUM(hours1) AS "tuesdayMinutes",
        SUM(hours2) AS "wednesdayMinutes",
        SUM(hours3) AS "thursdayMinutes",
        SUM(hours4) AS "fridayMinutes"
    FROM assistance s
    JOIN areas a ON (s."areaId" = a.id OR s."areaId0" = a.id)
    JOIN positions p ON (s."positionId" = p.id)
    WHERE s."mondayDate" = ${mondayDate} AND p.supervisor = false
    GROUP BY a.id`;

    for (const area of areas) {
      const [{ prod: mondayProd, goal: mondayGoal }] = await sql`
        select SUM(ordermovements.produccion) as prod, (${area.mondayMinutes} / AVG("produccionTime" / amount)) as goal from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${mondayDate} and ordermovements."produccion" is not null`;
      const [{ prod: tuesdayProd, goal: tuesdayGoal }] = await sql`
        select SUM(ordermovements.produccion) as prod, (${area.tuesdayMinutes} / AVG("produccionTime" / amount)) as goal from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 1)} and ordermovements."produccion" is not null`;

      const [{ prod: wednesdayProd, goal: wednesdayGoal }] = await sql`
        select SUM(ordermovements.produccion) as prod, (${area.wednesdayMinutes} / AVG("produccionTime" / amount)) as goal from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 2)} and ordermovements."produccion" is not null`;

      const [{ prod: thursdayProd, goal: thursdayGoal }] = await sql`
        select SUM(ordermovements.produccion) as prod, (${area.thursdayMinutes} / AVG("produccionTime" / amount)) as goal from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 3)} and ordermovements."produccion" is not null`;

      const [{ prod: fridayProd, goal: fridayGoal }] = await sql`
        select SUM(ordermovements.produccion) as prod, (${area.fridayMinutes} / AVG("produccionTime" / amount)) as goal from ordermovements join orders on orders.id = ordermovements."progressId" where "areaId" = ${area.id} and "date" = ${addDays(mondayDate, 4)} and ordermovements."produccion" is not null`;

      area.mondayAvg = mondayProd / mondayGoal;
      area.tuesdayAvg = tuesdayProd / tuesdayGoal;
      area.wednesdayAvg = wednesdayProd / wednesdayGoal;
      area.thursdayAvg = thursdayProd / thursdayGoal;
      area.fridayAvg = fridayProd / fridayGoal;
    }

    const result = areas.filter((area) => {
      const averages = [
        area.mondayAvg,
        area.tuesdayAvg,
        area.wednesdayAvg,
        area.thursdayAvg,
        area.fridayAvg,
      ];

      return !averages.every((avg) => isNaN(avg));
    });

    console.log(result);
    return result;
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
