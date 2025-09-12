import { promises as fs } from 'fs';
import path from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  generateZenpetSchema,
  generateUlineSchema,
  generateUlineRoundSchema,
} from './tools.schema';
import { z } from 'zod/v4';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
        text: new Date(body.date).toLocaleDateString('es-MX', {
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

  async generateUline(body: z.infer<typeof generateUlineSchema>) {
    if (body.pages > 20)
      throw new BadRequestException(
        'El rango de páginas no puede ser mayor a 20',
      );

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'uline',
      '96.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);

    for (let i = 0; i < body.pages - 1; i++) {
      const copiedPage = await pdfDoc.copyPages(pdfDoc, [0]);
      await pdfDoc.addPage(copiedPage[0]);
    }

    const pages = await pdfDoc.getPages();

    let number = body.start;

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (let pageNo = 0; pageNo < body.pages; pageNo++) {
      for (let col = 0; col < 16; col++) {
        for (let row = 0; row < 6; row++) {
          const width = font.widthOfTextAtSize(String(number), 20);
          pages[pageNo].drawText(String(number), {
            x: 42 + col * 36,
            y: 78 + row * 125.5 - width / 2,
            size: 20,
            color: rgb(0.2, 0.2, 0.2),
            rotate: degrees(90),
            font,
          });
          number++;
        }
      }
    }
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  async generateUlineRound(body: z.infer<typeof generateUlineRoundSchema>) {
    if (body.pages > 20)
      throw new BadRequestException(
        'El rango de páginas no puede ser mayor a 20',
      );

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'uline',
      'round.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);

    for (let i = 0; i < body.pages - 1; i++) {
      const copiedPage = await pdfDoc.copyPages(pdfDoc, [0]);
      await pdfDoc.addPage(copiedPage[0]);
    }

    const pages = await pdfDoc.getPages();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (let pageNo = 0; pageNo < body.pages; pageNo++) {
      for (let col = 0; col < 9; col++) {
        for (let row = 0; row < 12; row++) {
          const x = 62 + col * 58.25;
          const y = 73 + row * 58.25;

          pages[pageNo].drawText(String(body.year), {
            x,
            y: y - 12,
            size: 11,
            color: rgb(0.2, 0.2, 0.2),
            font,
          });

          pages[pageNo].drawText('S-' + String(body.week), {
            x,
            y,
            size: 11,
            color: rgb(0.2, 0.2, 0.2),
            font,
          });
        }
      }
    }
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
