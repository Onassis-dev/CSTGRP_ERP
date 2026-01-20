import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import { downloadLabelSchema } from './labels.schema';
import { format } from 'date-fns';
import { z } from 'zod/v4';

export function formatYamahaDate(date: string): string {
  const parsedDate = new Date(date);
  const weekNumber = format(parsedDate, 'ww');
  const year = parsedDate.getFullYear() - 2000;
  return `${weekNumber}${year}`;
}

export function formatCodigoYamahaDate(date: string): string {
  const formattedDate = format(new Date(date), 'yyMMdd');
  return `Y${formattedDate}Z`;
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MM/dd/yyyy');
}

export function createLabel(
  ctx: CanvasRenderingContext2D,
  { info, type }: z.infer<typeof downloadLabelSchema>,
) {
  if (type === 'info') {
    ctx.font = '120px SwissBold';
    const partWidth = ctx.measureText(info.code).width;
    const partX = (ctx.canvas.width - partWidth) / 2;
    ctx.fillText(info.code, partX, 300);

    ctx.font = '55px SwissBold';
    ctx.fillStyle = '#000000';
    ctx.fillText(info.jobpo, 730, 705);
    ctx.fillText(formatDate(info.date), 730, 805);

    ctx.font = '55px Swiss';
    const words = info.description.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1300) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }

    if (lines.length > 0) {
      const descWidth = ctx.measureText(lines[0]).width;
      const descX = (ctx.canvas.width - descWidth) / 2;
      ctx.fillText(lines[0], descX, 480);
    }

    if (lines.length > 1) {
      const desc2Width = ctx.measureText(lines[1]).width;
      const desc2X = (ctx.canvas.width - desc2Width) / 2;
      ctx.fillText(lines[1], desc2X, 540);
    }
  }

  if (type.includes('bastones')) {
    ctx.font = '74px Swiss';
    ctx.fillStyle = '#000000';

    const y = 130;

    const text = `${info.jobpo}   ${type === 'bastones' ? '' : type === 'bastones-back' ? 'REAR' : 'FRONT'}`;
    ctx.fillText(text, 35, y);
    ctx.fillText(text, 675, y);
  }

  if (type === 'kawasaki') {
    const x = [770, 265, 90, 360];
    let y = [190, 600, 650, 190];

    for (let i = 0; i < 2; i++) {
      if (i === 1) {
        y = y.map((coord) => coord + 620);
      }

      ctx.font = '50px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0]);
      ctx.fillText(info.code, x[1], y[1]);
      ctx.fillText(formatDate(info.date), x[3], y[3]);

      ctx.font = '45px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 1000) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      if (lines.length > 0) {
        ctx.fillText(lines[0], x[2], y[2]);
      }
      if (lines.length > 1) {
        ctx.fillText(lines[1], x[2], y[2] + 55);
      }
    }
  }

  if (type === 'yamaha') {
    const x = [850, 380, 180, 175];
    let y = [73, 610, 660, 73];

    for (let i = 0; i < 2; i++) {
      if (i === 1) {
        y = y.map((coord) => coord + 720);
      }

      ctx.font = '45px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0]);
      ctx.fillText('CS  ' + formatYamahaDate(info.date), x[3], y[3]);

      ctx.font = '65px SwissBold';
      ctx.fillText(info.code, x[1], y[1]);

      ctx.font = '40px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 1000) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      if (lines.length > 0) {
        ctx.fillText(lines[0], x[2], y[2]);
      }
      if (lines.length > 1) {
        ctx.fillText(lines[1], x[2], y[2] + 45);
      }
    }
  }

  if (type === 'outer-armor') {
    const x = [750, 300, 120, 140];
    let y = [460, 578, 638, 460];

    for (let i = 0; i < 2; i++) {
      if (i === 1) {
        y = y.map((coord) => coord + 753);
      }

      ctx.font = '60px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0]);
      ctx.fillText(formatDate(info.date), x[3], y[3]);
      ctx.fillText(info.code, x[1], y[1]);

      ctx.font = '45px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 1000) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      if (lines.length > 0) {
        ctx.fillText(lines[0], x[2], y[2]);
      }
      if (lines.length > 1) {
        ctx.fillText(lines[1], x[2], y[2] + 55);
      }
    }
  }

  if (type === 'commercial') {
    const x = [780, 320, 90, 360];
    let y = [165, 625, 680, 165];

    for (let i = 0; i < 2; i++) {
      if (i === 1) {
        y = y.map((coord) => coord + 678);
      }

      ctx.font = '60px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0]);
      ctx.fillText(formatDate(info.date), x[3], y[3]);
      ctx.fillText(info.code, x[1], y[1]);

      ctx.font = '45px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 1000) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      if (lines.length > 0) {
        ctx.fillText(lines[0], x[2], y[2]);
      }
      if (lines.length > 1) {
        ctx.fillText(lines[1], x[2], y[2] + 55);
      }
    }
  }

  if (type === 'yamaha-info') {
    const x = [175, 480];
    const baseY = 265;
    const adjustments = [-24, 0, 12, 11, 14];

    ctx.font = '40px SwissBold';
    ctx.fillStyle = '#000000';

    for (let i = 0; i < 5; i++) {
      const yPos = baseY + i * 292 + adjustments[i];

      ctx.fillText(info.jobpo, x[0], yPos);

      ctx.fillText(formatYamahaDate(info.date), x[1], yPos);
    }
  }

  if (type === 'yamaha-info-2') {
    const baseY = [245, 110, 155];
    const adjustments = [0, 0, 12, 14, 16];

    for (let i = 0; i < 5; i++) {
      const verticalOffset = i * 292 + adjustments[i];

      ctx.font = '70px SwissBold';
      const partWidth = ctx.measureText(info.code).width;
      const partX = (ctx.canvas.width - partWidth) / 2;
      ctx.fillText(info.code, partX, baseY[1] + verticalOffset);

      ctx.font = '40px SwissBold';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 500) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      if (lines.length > 0) {
        const desc1Width = ctx.measureText(lines[0]).width;
        const desc1X = (ctx.canvas.width - desc1Width) / 2;
        ctx.fillText(lines[0], desc1X, baseY[2] + verticalOffset);
      }

      if (lines.length > 1) {
        const desc2Width = ctx.measureText(lines[1]).width;
        const desc2X = (ctx.canvas.width - desc2Width) / 2;
        ctx.fillText(lines[1], desc2X, baseY[2] + verticalOffset + 40);
      }

      const jobWidth = ctx.measureText(info.jobpo).width;
      const jobX = (ctx.canvas.width - jobWidth) / 2;
      ctx.fillText(info.jobpo, jobX, baseY[0] + verticalOffset);
    }
  }

  if (type === 'codigo-yamaha') {
    const barcode1Canvas = createCanvas(0, 0);
    JsBarcode(barcode1Canvas, info.code.replace(/-/g, '').padEnd(12, '0'), {
      format: 'CODE39',
      width: 2,
      height: 100,
      displayValue: false,
    });

    const barcode2Canvas = createCanvas(0, 0);
    JsBarcode(barcode2Canvas, '1', {
      format: 'CODE39',
      width: 2,
      height: 60,
      displayValue: false,
    });

    ctx.drawImage(barcode1Canvas, 45, 255);
    ctx.drawImage(barcode2Canvas, 740, 140);

    const x = [520, 550, 550, 595, 200, 70];
    const y = [115, 263, 150, 198, 400, 400];

    ctx.font = '55px SwissBold';
    ctx.fillText(info.code, x[0], y[0]);
    ctx.fillText('1 PC.', x[3], y[3]);

    ctx.font = '26px Swiss';
    const words = info.description.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 420) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }

    if (lines.length > 0) ctx.fillText(lines[0], x[1], y[1]);
    if (lines.length > 1) ctx.fillText(lines[1], x[1], y[1] + 25);
    if (lines.length > 2) ctx.fillText(lines[2], x[1], y[1] + 50);

    ctx.font = '30px Swiss';
    ctx.fillText(formatCodigoYamahaDate(info.date), x[2], y[2]);

    ctx.font = '25px SwissBold';
    ctx.fillText(info.jobpo, x[5], y[5]);

    const madeText = 'MADE IN MEXICO';
    const madeWidth = ctx.measureText(madeText).width;
    const madeX = (550 - madeWidth) / 2 + 20;
    ctx.fillText(madeText, madeX, y[4]);
  }

  if (type === 'cantidad') {
    const x = [165, 0, 0, 1100, 870, 150, 1000];
    const y = [170, 350, 490, 170, 685, 790, 790];

    if (
      info.code === 'P0632-02' ||
      info.code === 'P6031-02' ||
      info.code === 'P0633-02' ||
      info.code.startsWith('18')
    ) {
      y[1] = 330;
      y[2] = 510;

      const barcodeCanvas = createCanvas(0, 100);
      JsBarcode(barcodeCanvas, info.code.replace(/-/g, ''), {
        format: 'CODE39',
        width: 2,
        height: 80,
        displayValue: false,
      });

      const barcodeX = (ctx.canvas.width - barcodeCanvas.width) / 2;
      ctx.drawImage(barcodeCanvas, barcodeX, 350);
    }

    ctx.font = '100px SwissBold';
    const partWidth = ctx.measureText(info.code).width;
    const partX = (ctx.canvas.width - partWidth) / 2;
    ctx.fillText(info.code, partX, y[1]);

    ctx.font = '60px SwissBold';
    ctx.fillText(info.jobpo, x[0], y[0]);
    ctx.fillText(formatDate(info.date), x[3], y[3]);
    ctx.fillText(String(info.amount), x[4], y[4]);
    ctx.fillText(info.so || '', x[5], y[5]);
    ctx.fillText(info.po || '', x[6], y[6]);

    ctx.font = '55px Swiss';

    const words = info.description.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1300) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }

    if (lines.length > 0) {
      const desc1Width = ctx.measureText(lines[0]).width;
      const desc1X = (ctx.canvas.width - desc1Width) / 2;
      ctx.fillText(lines[0], desc1X, y[2]);
    }
    if (lines.length > 1) {
      const desc2Width = ctx.measureText(lines[1]).width;
      const desc2X = (ctx.canvas.width - desc2Width) / 2;
      ctx.fillText(lines[1], desc2X, y[2] + 60);
    }
  }

  if (type === 'codigo-kawasaki') {
    const x = [125, 0, 0, 700, 0, 700];
    const y = [500, 190, 370, 105, 210, 500];
    const height = 520;
    const adjustments = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      const verticalOffset = height * i + adjustments[i];

      ctx.font = '60px SwissBold';
      const partWidth = ctx.measureText(info.code).width;
      const partX = (ctx.canvas.width - partWidth) / 2;
      ctx.fillText(info.code, partX, y[1] + verticalOffset);

      ctx.font = '40px SwissBold';
      ctx.fillText(formatDate(info.date), x[3], y[3] + verticalOffset);
      ctx.fillText(info.jobpo, x[0], y[0] + verticalOffset);
      ctx.fillText(info.po || '', x[5], y[5] + verticalOffset);

      const barcodeCanvas = createCanvas(0, 0);
      JsBarcode(barcodeCanvas, info.code.replace(/-/g, ''), {
        format: 'CODE39',
        width: 2,
        height: 80,
        displayValue: false,
      });
      const barcodeX = (ctx.canvas.width - barcodeCanvas.width) / 2;
      ctx.drawImage(barcodeCanvas, barcodeX, y[4] + verticalOffset);

      ctx.font = '40px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 800) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      const desc1Width = ctx.measureText(lines[0]).width;
      const desc1X = (ctx.canvas.width - desc1Width) / 2;

      let desc2X = 0;
      if (lines.length > 1) {
        const desc2Width = ctx.measureText(lines[1]).width;
        desc2X = (ctx.canvas.width - desc2Width) / 2;
      }
      ctx.fillText(lines[0], desc1X, y[2] + verticalOffset);
      if (lines.length > 1) {
        ctx.fillText(lines[1], desc2X, y[2] + verticalOffset + 45);
      }
    }
  }

  if (type === 'codigo-polaris') {
    const x = [125, 0, 0, 700, 0];
    const y = [105, 190, 380, 105, 220];
    const height = 520;
    const adjustments = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      const verticalOffset = height * i + adjustments[i];

      ctx.font = '60px SwissBold';
      const partWidth = ctx.measureText(info.code).width;
      const partX = (ctx.canvas.width - partWidth) / 2;
      ctx.fillText(info.code, partX, y[1] + verticalOffset);

      ctx.font = '40px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0] + verticalOffset);
      ctx.fillText(formatDate(info.date), x[3], y[3] + verticalOffset);

      const barcodeCanvas = createCanvas(0, 0);
      JsBarcode(barcodeCanvas, info.code.replace(/-/g, ''), {
        format: 'CODE39',
        width: 2,
        height: 80,
        displayValue: false,
      });
      const barcodeX = (ctx.canvas.width - barcodeCanvas.width) / 2;
      ctx.drawImage(barcodeCanvas, barcodeX, y[4] + verticalOffset);

      ctx.font = '40px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 800) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      const desc1Width = ctx.measureText(lines[0]).width;
      const desc1X = (ctx.canvas.width - desc1Width) / 2;
      ctx.fillText(lines[0], desc1X, y[2] + verticalOffset);

      if (lines.length > 1) {
        const desc2Width = ctx.measureText(lines[1]).width;
        const desc2X = (ctx.canvas.width - desc2Width) / 2;
        ctx.fillText(lines[1], desc2X, y[2] + verticalOffset + 45);
      }
    }
  }

  if (type === 'codigo-chaparral') {
    const x = [125, 0, 0, 670, 0, 660, 140];
    const y = [110, 200, 375, 110, 205, 470, 470];
    const height = 520;
    const adjustments = [0, 10, 10];

    for (let i = 0; i < 3; i++) {
      const verticalOffset = height * i + adjustments[i];

      ctx.font = '60px SwissBold';
      const partWidth = ctx.measureText(info.code).width;
      const partX = (ctx.canvas.width - partWidth) / 2;
      ctx.fillText(info.code, partX, y[1] + verticalOffset);

      ctx.font = '40px SwissBold';
      ctx.fillText(info.jobpo, x[0], y[0] + verticalOffset);
      ctx.fillText(formatDate(info.date), x[3], y[3] + verticalOffset);
      ctx.fillText(info.po || '', x[5], y[5] + verticalOffset);
      ctx.fillText(info.so || '', x[6], y[6] + verticalOffset);

      const barcodeCanvas = createCanvas(0, 0);
      JsBarcode(barcodeCanvas, info.code.replace(/-/g, ''), {
        format: 'CODE39',
        width: 4,
        height: 110,

        displayValue: false,
      });
      const barcodeX = (ctx.canvas.width - barcodeCanvas.width) / 2;
      ctx.drawImage(barcodeCanvas, barcodeX, y[4] + verticalOffset);

      ctx.font = '32px Swiss';
      const words = info.description.split(' ');
      let line = '';
      const lines = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 800) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      const desc1Width = ctx.measureText(lines[0]).width;
      const desc1X = (ctx.canvas.width - desc1Width) / 2;
      ctx.fillText(lines[0], desc1X, y[2] + verticalOffset);

      if (lines.length > 1) {
        const desc2Width = ctx.measureText(lines[1]).width;
        const desc2X = (ctx.canvas.width - desc2Width) / 2;
        ctx.fillText(lines[1], desc2X, y[2] + verticalOffset + 45);
      }
    }
  }
}
