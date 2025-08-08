import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { formatDate } from 'src/utils/functions';
import { ContextProvider } from 'src/interceptors/context.provider';

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
      await sql`select id as value, name from incidences order by name`;
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
}
