import { promises as fs } from 'fs';
import path from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { generateZenpetSchema } from './tools.schema';
import { z } from 'zod/v4';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';

@Injectable()
export class ToolsService {
  async generateZenpet(body: z.infer<typeof generateZenpetSchema>) {
    if (body.start >= body.end)
      throw new BadRequestException('El final debe ser mayor al inicio');
    if (body.end - body.start > 200)
      throw new BadRequestException(
        'El rango de números no puede ser mayor a 200',
      );

    const pageCount = Math.ceil((body.end - body.start + 1) / 10);

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'zenpet',
      body.product,
      body.size + '.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < pageCount - 1; i++) {
      const copiedPage = await pdfDoc.copyPages(pdfDoc, [0]);
      await pdfDoc.addPage(copiedPage[0]);
    }

    const getNumberXPosition = (i: number) => 180 + (i % 2) * 300;
    const getDateXPosition = (i: number) => 225 + (i % 2) * 300;
    const getYPosition = (i: number) => 630 - (Math.floor(i / 2) % 10) * 144;

    const pages = await pdfDoc.getPages();

    let number = body.start;
    let i = 0;
    let pageNo = -1;
    while (true) {
      if (i % 10 === 0) pageNo++;
      if (i === 10) i = 0;

      console.log(getYPosition(i));
      fillBox({
        page: pages[pageNo],
        font,
        text: String(number),
        size: 10,
        x: getNumberXPosition(i),
        y: getYPosition(i),
        width: 40,
        height: 13,
        align: 'center',
      });

      fillBox({
        page: pages[pageNo],
        font,
        text: new Date().toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        size: 6,
        x: getDateXPosition(i),
        y: getYPosition(i),
        width: 40,
        height: 13,
        align: 'center',
      });

      if (number >= body.end) break;
      i++;
      number++;
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
