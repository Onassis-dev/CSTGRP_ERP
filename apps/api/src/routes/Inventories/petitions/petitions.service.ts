import { promises as fs } from 'fs';
import { format, toZonedTime } from 'date-fns-tz';
import { Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { filterSchema } from './petitions.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';
import { idObjectSchema } from 'src/utils/schemas';

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
      'req.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page] = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    fillBox({
      page,
      font,
      text: requisition.folio.toString(),
      size: 12,
      x: 467,
      y: 695,
      width: 100,
      height: 25,
      align: 'center',
    });

    fillBox({
      page,
      font,
      text: requisition.jobs,
      size: 12,
      x: 85,
      y: 578,
      width: 390,
      height: 27,
    });

    fillBox({
      page,
      font,
      text: requisition.code,
      size: 12,
      x: 85,
      y: 540,
      width: 140,
      height: 35,
    });

    fillBox({
      page,
      font,
      text: requisition.description,
      size: 8,
      x: 295,
      y: 535,
      width: 160,
      height: 35,
      maxLines: 3,
    });

    fillBox({
      page,
      font,
      text: requisition.petitioner,
      size: 12,
      x: 90,
      y: 660,
      width: 260,
      height: 30,
    });

    fillBox({
      page,
      font,
      text: requisition.area,
      size: 12,
      x: 430,
      y: 660,
      width: 130,
      height: 30,
    });

    fillBox({
      page,
      font,
      text:
        String(requisition.necesary).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
        ' ' +
        requisition.measurement,
      size: 11,
      x: 470,
      y: 560,
      width: 90,
      height: 28,
      align: 'center',
    });

    fillBox({
      page,
      font,
      text:
        String(requisition.requested).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
        ' ' +
        requisition.measurement,
      size: 11,
      x: 470,
      y: 510,
      width: 90,
      height: 28,
      align: 'center',
    });

    fillBox({
      page,
      font,
      text: format(
        toZonedTime(requisition.created_at, 'America/Tijuana'),
        'dd/MM/yyyy',
      ),
      size: 12,
      x: 150,
      y: 695,
      width: 140,
      height: 40,
    });

    fillBox({
      page,
      font,
      text: format(
        toZonedTime(requisition.created_at, 'America/Tijuana'),
        'HH:mm',
      ),
      size: 12,
      x: 380,
      y: 695,
      width: 80,
      height: 40,
      align: 'center',
    });

    const motivesPosition = {
      Empaque: 270,
      Producción: 190,
      'Corte de tela': 345,
      'Cortes varios': 445,
    };

    page.drawText('X', {
      x: motivesPosition[requisition.motive],
      y: 630,
      size: 12,
    });

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }

  async deleteRequisition(body: z.infer<typeof idObjectSchema>) {
    let deletedObj;
    await sql.begin(async (sql) => {
      [deletedObj] =
        await sql`delete from requisitions where id = ${body.id} returning folio`;

      await this.req.record(`Elimino la peticion ${deletedObj.folio}`, sql);
    });
    return;
  }
}
