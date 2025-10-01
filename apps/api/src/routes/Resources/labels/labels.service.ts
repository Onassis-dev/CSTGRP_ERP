import { Injectable } from '@nestjs/common';
import { downloadLabelSchema } from './labels.schema';
import { File } from '@nest-lab/fastify-multer';
import { z } from 'zod/v4';
import {
  processJob,
  processPDF,
} from 'src/routes/Inventories/various/various.utils';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { createLabel } from './labels.create';

@Injectable()
export class LabelsService {
  async getJob(file: File) {
    const pdfText = await processPDF(file);
    return await processJob(pdfText);
  }

  async print(body: z.infer<typeof downloadLabelSchema>) {
    const baseImagePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'labels',
      body.type + '.jpg',
    );
    const baseImage = await loadImage(baseImagePath);

    registerFont(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'fonts',
        'Swiss.ttf',
      ),
      { family: 'Swiss' },
    );
    registerFont(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'fonts',
        'SwissBold.ttf',
      ),
      { family: 'SwissBold' },
    );

    // Create canvas with base image dimensions
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImage, 0, 0);

    createLabel(ctx, body);

    const buffer = canvas.toBuffer('image/jpeg');
    return buffer;
  }
}
