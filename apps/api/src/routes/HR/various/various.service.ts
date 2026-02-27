import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { formatDate } from 'src/utils/functions';
import { ContextProvider } from 'src/interceptors/context.provider';
import puppeteer from 'puppeteer';
import Mustache from 'mustache';
import { promises as fs } from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';

@Injectable()
export class VariousService {
  constructor(private readonly req: ContextProvider) {}
  async getAreas() {
    const rows =
      await sql`select id as value, name, color, type, active from areas`;
    return rows;
  }

  async getAssistanceAreas() {
    const rows =
      await sql`select id as value, name, color, type, active from areas where id in (select unnest(assistance_areas) from users where id = ${this.req.userId})`;
    return rows;
  }

  async getPositions() {
    const rows =
      await sql`select id as value, name, color, active from positions`;
    return rows;
  }

  async getIncidences() {
    const rows =
      await sql`select id as value, name, code from incidences order by name`;
    return rows;
  }

  async generateImage(query) {
    // Get employee data from database
    const [employee] =
      await sql`select "bornDate", photo, CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name from employees where "noEmpleado" = ${query.noEmpleado}`;

    // Define paths
    const baseImagePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'birthday.png',
    );

    const employeePhotoPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'storage',
      employee.photo,
    );

    // Load images
    const baseImage = await loadImage(baseImagePath);
    const overlayImage = await loadImage(employeePhotoPath);

    // Load fonts
    registerFont(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'fonts',
        'Coustard-Regular.ttf',
      ),
      { family: 'Coustard' },
    );

    // Create canvas with base image dimensions
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    // Draw base image
    ctx.drawImage(baseImage, 0, 0);

    // Handle the cover functionality (similar to Jimp's cover)
    const overlayWidth = 700;
    const overlayHeight = 850;

    // Calculate scaling and position to cover the target dimensions
    const scale = Math.max(
      overlayWidth / overlayImage.width,
      overlayHeight / overlayImage.height,
    );

    const scaledWidth = overlayImage.width * scale;
    const scaledHeight = overlayImage.height * scale;

    const cropX = (scaledWidth - overlayWidth) / 2;
    const cropY = (scaledHeight - overlayHeight) / 2;

    // Draw the overlay image (centered horizontally)
    const xPosition = (baseImage.width - overlayWidth) / 2;
    const yPosition = 370;

    ctx.save();
    ctx.beginPath();
    ctx.rect(xPosition, yPosition, overlayWidth, overlayHeight);
    ctx.clip();
    ctx.drawImage(
      overlayImage,
      -cropX + xPosition,
      -cropY + yPosition,
      scaledWidth,
      scaledHeight,
    );
    ctx.restore();

    // Set up text rendering
    const nameParts = employee.name.split(' ');
    const text = nameParts.slice(0, 3).join(' ');
    const text2 = nameParts.slice(3).join(' ');
    const text1 =
      formatDate(employee.bornDate.toISOString()).slice(0, -4) +
      new Date().getFullYear();

    // Configure text styles
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#3662ac';

    // Print first part of name
    ctx.font = '60px Coustard';
    ctx.fillText(text, baseImage.width / 2, 1260);

    // Print second part of name (if it exists)
    if (text2) {
      ctx.fillText(text2, baseImage.width / 2, 1340);
    }

    // Print date
    ctx.font = '50px Coustard';
    ctx.fillText(text1, baseImage.width / 2, 1440);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/jpeg');

    return buffer;
  }

  async generateBirthdaysList(query) {
    const rows =
      await sql`SELECT "noEmpleado", photo, CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name, "bornDate" from employees where active = true and extract(month from "bornDate") = extract(month from ${query.date}::DATE)`;

    const storageDir = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'storage',
    );

    const placeholderSvg =
      '<svg class="photo-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

    const rowsHtml = await Promise.all(
      rows.map(async (row) => {
        let photoHtml = placeholderSvg;
        if (row.photo) {
          try {
            const photoPath = path.join(storageDir, row.photo);
            const buf = await fs.readFile(photoPath);
            const base64 = buf.toString('base64');
            const mime =
              path.extname(row.photo).toLowerCase() === '.png'
                ? 'image/png'
                : 'image/jpeg';
            photoHtml = `<img src="data:${mime};base64,${base64}" alt="" />`;
          } catch {
            // keep placeholder if file missing
          }
        }
        const bornDateStr = row.bornDate
          ? formatDate(row.bornDate.toISOString())
          : '';
        return `
  <div class="row">
    <div class="photo-wrap">${photoHtml}</div>
    <div class="info">
      <p class="name">${row.name ?? ''}</p>
      <p class="date">${bornDateStr}</p>
    </div>
  </div>`;
      }),
    );

    const template = await fs.readFile(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'templates',
        'hr',
        'birthdays.html',
      ),
      'utf-8',
    );

    const templateData = { rows: rowsHtml.join('') };
    const html = Mustache.render(template, templateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/usr/bin/google-chrome'
          : undefined,
    });
    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.7in',
        right: '0.7in',
        bottom: '0.7in',
        left: '0.7in',
      },
    });

    await browser.close();
    return pdf;
  }

  async generateEmployeesNamesPdf() {
    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'uline',
      'S-5042.pdf',
    );

    const employees =
      await sql`select CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name, "noEmpleado" from employees where active = true order by "noEmpleado" desc`;

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageCount = Math.ceil(employees.length / 30);

    for (let i = 0; i < pageCount - 1; i++) {
      const copiedPage = await pdfDoc.copyPages(pdfDoc, [0]);
      await pdfDoc.addPage(copiedPage[0]);
    }

    const pages = await pdfDoc.getPages();

    let y = 690;
    let x = 20;

    let i = 1;
    let pageNo = 0;
    for (const employee of employees) {
      fillBox({
        page: pages[pageNo],
        font,
        text: employee.noEmpleado,
        size: 14,
        x: x,
        y: y + 40,
        width: 160,
        height: 20,
        align: 'center',
      });
      fillBox({
        page: pages[pageNo],
        font,
        text: employee.name,
        size: 14,
        x: x,
        y: y,
        width: 160,
        height: 40,
        align: 'center',
      });

      x += 200;
      if (i % 3 === 0) {
        x = 20;
        y -= 72;
      }
      if (i % 30 === 0) {
        pageNo++;
        y = 690;
        x = 20;
      }

      i++;
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
