import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import { idObjectSchema } from 'src/utils/schemas';
import { format } from 'date-fns';
import { createVacationSchema } from './vacations.schema';
import { calculateVacationDays } from 'src/utils/functions';
import { es } from 'date-fns/locale';

@Injectable()
export class VacationsService {
  constructor(private readonly req: ContextProvider) {}

  async getVacations(body: z.infer<typeof idObjectSchema>) {
    const res = await sql`select date, days, notes
    from (
      select date, days, null as notes
      from "vacationsGranted"
      where "employeeId" = ${body.id}
      union all
      select "startDate" as date, -days as days, notes
      from "vacations"
      where "employeeId" = ${body.id}
    )
    order by date desc
    `;
    return res.map((row: any) => ({
      ...row,
      date: format(row.date, 'dd MMMM, yyyy', { locale: es }),
    }));
  }

  async createVacation(body: z.infer<typeof createVacationSchema>) {
    await sql.begin(async (sql) => {
      const [employee] =
        await sql`insert into "vacations" ${sql(body)} returning (select "noEmpleado" from employees where id = "employeeId")`;

      await calculateVacationDays(body.employeeId, sql);

      await this.req.record(
        `Creó un permiso de vacaciones para el empleado ${employee.noEmpleado} de ${body.days} días`,
        sql,
      );
    });
  }
}
