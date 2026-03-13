import { promises as fs } from 'fs';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { downloadMultipleSchema, filterSchema } from './petitions.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { idObjectSchema } from 'src/utils/schemas';
import { fillRequisition } from './petitions.create';

@Injectable()
export class PetitionsService {
  constructor(private readonly req: ContextProvider) {}

  async getPetitions(body: z.infer<typeof filterSchema>) {
    const movements =
      await sql`Select requisitions.id, requisitions.folio, requisitions.requested, requisitions.necesary,
      materials.code, materials.description, materials.measurement
      from requisitions
      JOIN materials on materials.id = requisitions."materialId"
      WHERE TRUE
      ${body.folio ? sql`and folio = ${body.folio}` : sql``} 
      ${body.code ? sql`and materials.code LIKE ${'%' + body.code + '%'}` : sql``}
       order by folio desc limit 100`;
    return movements;
  }

  async download(body: z.infer<typeof idObjectSchema>) {
    const [requisition] =
      await sql`select requisitions.*, materials.code, materials.description, materials.measurement from requisitions
      join materials on requisitions."materialId" = materials.id
      where requisitions.id = ${body.id}`;

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'req1.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page] = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    fillRequisition(page, font, requisition, 'top');

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }

  async downloadMultiple(body: z.infer<typeof downloadMultipleSchema>) {
    const requisitions =
      await sql`select requisitions.*, materials.code, materials.description, materials.measurement from requisitions
    join materials on requisitions."materialId" = materials.id
    where requisitions.id in ${sql(body.list)}`;

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'req1.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pageCount = Math.ceil(requisitions.length / 2);

    for (let i = 0; i < pageCount - 1; i++) {
      const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [0]);
      pdfDoc.addPage(copiedPage);
    }

    const pages = await pdfDoc.getPages();

    let i = 0;
    for (const page of pages) {
      fillRequisition(page, font, requisitions[i], 'top');
      i++;
      if (i < requisitions.length) {
        fillRequisition(page, font, requisitions[i], 'bottom');
        i++;
      }
    }

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }

  async deleteRequisition(body: z.infer<typeof idObjectSchema>) {
    let deletedObj;

    await sql.begin(async (sql) => {
      const movements =
        await sql`select id from materialmovements where "reqId" = ${body.id} and active = true`;
      if (movements.length)
        throw new HttpException('La peticion esta en uso', 400);

      [deletedObj] =
        await sql`delete from requisitions where id = ${body.id} returning folio`;

      await this.req.record(`Elimino la peticion ${deletedObj.folio}`, sql);
    });
    return;
  }
}
