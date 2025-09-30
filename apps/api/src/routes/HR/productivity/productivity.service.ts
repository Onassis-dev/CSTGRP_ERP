import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { getWeekDays } from 'src/utils/functions';
import { weekSchema, editSchema } from './productivity.schema';

@Injectable()
export class ProductivityService {
  async getWeek(body: z.infer<typeof weekSchema>) {
    const [firstDate] = getWeekDays(body.date);

    const productivity = await sql`select employeeproductivity.*,
    employees.name || ' ' || employees."paternalLastName" || ' ' || employees."maternalLastName" as name,
    employees."noEmpleado",
    assistance."areaId",
    assistance."positionId",
    "incidenceId0",
    "incidenceId1",
    "incidenceId2",
    "incidenceId3",
    "incidenceId4"

    FROM employeeproductivity
    JOIN assistance on assistance.id = employeeproductivity."assistanceId"
    JOIN employees on employees.id = assistance."employeeId"
    WHERE assistance."mondayDate" = ${firstDate}
    ORDER BY employeeproductivity.id`;

    return productivity;
  }

  async editSingle(body: z.infer<typeof editSchema>) {
    await sql`update employeeproductivity set ${sql(body)} where id = ${body.id}`;
    return;
  }
}
