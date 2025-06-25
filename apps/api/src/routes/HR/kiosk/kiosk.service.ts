import { Injectable, HttpException } from '@nestjs/common';
import { getDataSchema } from './kiosk.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';

@Injectable()
export class KioskService {
  async getData(query: z.infer<typeof getDataSchema>) {
    const [employee] = await sql`select *,
      concat(name, ' ', "paternalLastName", ' ', "maternalLastName") as name,
      (select "name" from areas where "id" = "areaId") as area,
      (select "name" from positions where "id" = "positionId") as position
      from employees where "noEmpleado" = ${query.noEmpleado} and RIGHT(rfc, 3) = RIGHT(${query.rfc}, 3)`;

    if (!employee) {
      throw new HttpException('Datos incorrectos', 400);
    }

    return employee;
  }
}
