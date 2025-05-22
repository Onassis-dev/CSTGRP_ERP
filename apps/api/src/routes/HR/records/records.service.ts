import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import {
  createRecordSchema,
  getEmployeeHistorySchema,
  idSchema,
} from './records.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { ContextProvider } from 'src/interceptors/context.provider';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { drawAlta, drawBaja, drawSalary } from './records.utils';
// import { markPage } from 'src/utils/pdf';

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
        er.doc,
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

  async downloadDoc(body: z.infer<typeof idSchema>) {
    const [record] =
      await sql`select * from employeeRecords where id = ${body.id}`;

    let data;
    try {
      data = JSON.parse(record.doc);
    } catch (error) {
      data = record.doc;
    }

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'Movimientos Internos.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page] = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // markPage(page);

    if (data.type === 'alta') drawAlta(page, font, data);

    if (data.type === 'baja') drawBaja(page, font, data);

    if (data.type === 'salario') drawSalary(page, font, data);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
