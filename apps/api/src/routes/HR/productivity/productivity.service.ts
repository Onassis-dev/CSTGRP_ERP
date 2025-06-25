import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { getWeekDays } from 'src/utils/functions';
import { weekSchema, editSchema } from './productivity.schema';

@Injectable()
export class ProductivityService {
  async getWeek(body: z.infer<typeof weekSchema>) {
    const [firstDate] = getWeekDays(body.date);

    const productivity = await sql`select *,
    (select name from employees where id = (select "employeeId" from assistance where id = employeeproductivity."assistanceId")),
    (select "noEmpleado" from employees where id = (select "employeeId" from assistance where id = employeeproductivity."assistanceId")),
    (select id from areas where id = (select "areaId" from assistance where id = employeeproductivity."assistanceId")) as "areaId",
    (select id from positions where id = (select "positionId" from assistance where id = employeeproductivity."assistanceId")) as "positionId",
    (select "incidenceId0" from assistance where id = "assistanceId"),
    (select "incidenceId1" from assistance where id = "assistanceId"),
    (select "incidenceId2" from assistance where id = "assistanceId"),
    (select "incidenceId3" from assistance where id = "assistanceId"),
    (select "incidenceId4" from assistance where id = "assistanceId")

    from employeeproductivity WHERE (select "mondayDate" from assistance where id = "assistanceId") = ${firstDate}
    ORDER BY employeeproductivity.id`;

    return productivity;
  }

  async editSingle(body: z.infer<typeof editSchema>) {
    await sql`update employeeproductivity set ${sql(body)} where id = ${body.id}`;
    return;
  }
}
