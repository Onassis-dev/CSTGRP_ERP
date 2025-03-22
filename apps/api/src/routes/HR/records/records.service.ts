import { Injectable } from '@nestjs/common';
import { createRecordSchema, getEmployeeHistorySchema } from './records.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';

@Injectable()
export class RecordsService {
  constructor(private readonly req: ContextProvider) {}

  async getEmployeeHistory(body: z.infer<typeof getEmployeeHistorySchema>) {
    return await sql`
      SELECT 
        er.id,
        er.date,
        er.type,
        er.text,
        e.name,
        e."paternalLastName",
        e."maternalLastName"
      FROM employeeRecords er
      JOIN employees e ON e.id = er."employeeId"
      WHERE er."employeeId" = ${body.employeeId}
      ORDER BY er.date DESC
    `;
  }

  async uploadRecord(body: z.infer<typeof createRecordSchema>) {
    await sql.begin(async (sql) => {
      await sql`
      INSERT INTO employeeRecords ("employeeId", date, type, text) 
      VALUES (${body.employeeId}, ${body.date}, ${body.type}, ${body.text})
    `;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${body.employeeId}`;
      await this.req.record(
        `Creó un registro de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} el ${body.date}`,
        sql,
      );
    });
  }
}
