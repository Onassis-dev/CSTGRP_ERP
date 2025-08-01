import { File } from '@nest-lab/fastify-multer';
import { HttpException, Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import exceljs from 'exceljs';
import { processImport, processJob, processPDF } from './various.utils';

@Injectable()
export class VariousService {
  async getMeasurement(body) {
    const rows =
      await sql`select measurement from materials where code = ${body.code}`;
    if (!rows[0]) return;
    return rows[0].measurement;
  }

  async getMaterials() {
    const rows = await sql`select code from materials`;
    return rows.map((row) => row.code);
  }

  async getClients() {
    const rows = await sql`select id as value, name, color from clients`;
    return rows;
  }

  async getAreas() {
    const rows = await sql`select id as value, name from areas`;
    return rows;
  }

  async convertJobPdf(pdfFile: File) {
    try {
      const pdfText = await processPDF(pdfFile);

      return await processJob(pdfText);
    } catch (err) {
      console.log(err);
      throw new HttpException('PDF invalido', 400);
    }
  }

  async convertImportPdf(pdfFile: File) {
    try {
      const pdfText = await processPDF(pdfFile);

      return processImport(pdfText);
    } catch (err) {
      console.log(err);
      throw new HttpException('PDF invalido', 400);
    }
  }

  async convertExcel(file: File) {
    if (!file.buffer) throw new HttpException('sin archivo', 400);
    try {
      const wb = new exceljs.Workbook();
      await wb.xlsx.load(file.buffer);

      const ws = wb.getWorksheet(1);

      const part = ws.getCell(4, 5).value;
      const jobpo = ws.getCell(6, 5).value;
      const amount = ws.getCell(7, 5).value;
      let due = ws.getCell(9, 5).value;

      const corteTime = ws.getCell(4, 7).value;
      const serigrafiaTime = ws.getCell(5, 7).value;
      const cortesVariosTime = ws.getCell(6, 7).value;
      const produccionTime = ws.getCell(7, 7).value;
      const calidadTime = ws.getCell(8, 7).value;

      if (due instanceof Date) {
        due = due.toISOString().split('T')[0];
      } else {
        throw new HttpException('Fecha incorrecta', 400);
      }

      const materials = ws
        .getRows(12, 100)
        .map((row) => {
          let amount = row.getCell(8).value;
          if (typeof amount === 'object') amount = (amount as any)?.result;
          if (typeof amount === 'number') amount = amount.toFixed(2);
          if (typeof amount === 'undefined' || isNaN(Number(amount)))
            amount = '0.00';

          const code = row.getCell(4).value;

          return {
            code,
            amount,
            realAmount: amount,
            active: false,
          };
        })
        .filter((item) => item.code);

      return {
        jobpo,
        due,
        materials,
        part,
        amount,
        corteTime,
        serigrafiaTime,
        cortesVariosTime,
        produccionTime,
        calidadTime,
      };
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) throw err;
      throw new HttpException('Excel invalido', 400);
    }
  }
}
