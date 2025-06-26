import { promises as fs } from 'fs';
import { HttpException, Injectable } from '@nestjs/common';
import {
  contractSchema,
  createDocSchema,
  editDocSchema,
  getDocumentsSchema,
} from './documents.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { deleteFile, saveFile } from 'src/utils/storage';
import { File } from '@nest-lab/fastify-multer';
import { ContextProvider } from 'src/interceptors/context.provider';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { promises as fsPromises } from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';
import util from 'util';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createCanvas, registerFont } from 'canvas';
import { loadImage } from 'canvas';
import { numberToWords } from './documents.utils';
import { generateApplication } from './documents.generate';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { idObjectSchema } from 'src/utils/schemas';
const convert = util.promisify(libre.convert);

@Injectable()
export class DocumentsService {
  constructor(private readonly req: ContextProvider) {}

  async getDocuments(body: z.infer<typeof getDocumentsSchema>) {
    return await sql`select * from documents where "employeeId" = ${body.employeeId}`;
  }

  async uploadDocument(body: z.infer<typeof createDocSchema>, file: File) {
    const [exists] =
      await sql`select 1 from documents where name = ${body.name} and "employeeId" = ${body.employeeId}`;
    if (exists)
      throw new HttpException('Ya se tiene un documento con ese nombre', 400);
    if (!file) throw new HttpException('Falta el archivo', 400);

    const url = await saveFile(file, 'employees');

    await sql.begin(async (sql) => {
      await sql`insert into documents (url, name, "employeeId") values (${url}, ${body.name}, ${body.employeeId}) `;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${body.employeeId}`;

      await this.req.record(
        `Subió un documento (${body.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }
  async editDocument(body: z.infer<typeof editDocSchema>, file: File) {
    const [exists] =
      await sql`select id from documents where name = ${body.name} and "employeeId" = (select "employeeId" from documents where id = ${body.id}) and id <> ${body.id}`;
    if (exists)
      throw new HttpException('Ya se tiene un documento con ese nombre', 400);

    const [prevDoc] = await sql`select * from documents where id = ${body.id}`;

    const url = await saveFile(file, 'employees', prevDoc.url);

    await sql.begin(async (sql) => {
      await sql`update documents set ${sql({ ...body, url, created_at: new Date() })} where id = ${body.id}`;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${prevDoc.employeeId}`;

      await this.req.record(
        `Editó un documento (${prevDoc.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }

  async deleteDocument(body: z.infer<typeof idObjectSchema>) {
    const [document] = await sql`select * from documents where id = ${body.id}`;
    await deleteFile(document.url);

    await sql.begin(async (sql) => {
      await sql`delete from documents where id = ${body.id}`;

      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName" from employees where id = ${document.employeeId}`;

      await this.req.record(
        `Eliminó un documento (${document.name}) de ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName}`,
        sql,
      );
    });
  }

  async downloadApplication(body: z.infer<typeof idObjectSchema>) {
    const [employee] = await sql`select * from employees where id = ${body.id}`;

    const templatePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'templates',
      'solicitud_empleo.pdf',
    );

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);
    const [page, page2] = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // markPage(page2);

    generateApplication(page, page2, font, employee);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  async getContract(body: z.infer<typeof contractSchema>) {
    const [employee] = await sql`select * from employees where id = ${body.id}`;

    const contract = await fsPromises.readFile(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'static',
        'contracts',
        body.number === 3
          ? 'CONTRATO INDETERMINADO.docx'
          : 'CONTRATO DETERMINADO.docx',
      ),
      'binary',
    );

    const zip = new PizZip(contract);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const contractDate = new Date(employee.admissionDate);
    contractDate.setDate(contractDate.getDate() + 30 * body.number);

    function calculateAge() {
      let edad = contractDate.getFullYear() - employee.bornDate.getFullYear();
      const mes = contractDate.getMonth() - employee.bornDate.getMonth();

      if (
        mes < 0 ||
        (mes === 0 && contractDate.getDate() < employee.bornDate.getDate())
      ) {
        edad--;
      }

      return edad;
    }

    const numbers = String(employee.nominaSalary).split('.');
    let textSalary = numberToWords(Number(numbers[0]));
    if (numbers[1] && numbers[1] !== '00')
      textSalary += ` con ${numbers[1]}/100 M.N.`;
    else textSalary += ' M.N.';

    doc.render({
      ...employee,
      fullName: `${employee.paternalLastName} ${employee.maternalLastName} ${employee.name}`,
      genre: employee.genre === 'M' ? 'Masculino' : 'Femenino',
      date: format(contractDate, `dd 'de' MMMM 'de' yyyy`, {
        locale: es,
      }),
      nominalSalary: employee.nominaSalary,
      age: calculateAge(),
      textSalary,
    });

    const docxBuf = doc.getZip().generate({
      type: 'nodebuffer',
    });

    const pdfBuf = await convert(docxBuf, 'pdf', undefined);
    return pdfBuf;
  }

  async generateImage(body: z.infer<typeof idObjectSchema>) {
    const [employee] =
      await sql`select *, concat(name, ' ', "paternalLastName", ' ', "maternalLastName") as name, (select name from positions where id = "positionId") as position from employees where id = ${body.id}`;
    return await generateImage(employee);
  }
}

async function generateImage(employee) {
  registerFont(
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'fonts',
      'OpenSans-Bold.ttf',
    ),
    {
      family: 'OpenSansBold',
    },
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
      'OpenSans-Regular.ttf',
    ),
    {
      family: 'OpenSansRegular',
    },
  );

  // Define fonts
  const font1 = '25px "OpenSansBold"';
  const font2 = '35px "OpenSansBold"';
  const font3 = '30px "OpenSansRegular"';
  const font5 = '25px "OpenSansBold"';
  const font6 = '33px "OpenSansBold"';
  const font7 = '33px "OpenSansRegular"';

  const black = '#000000';
  const white = '#FFFFFF';

  // ------------- FRONT SIDE -------------

  // Load base image

  const frontBaseImage = await loadImage(
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'credentials',
      'frontbase.png',
    ),
  );

  // Create canvas with base image dimensions
  const frontCanvas = createCanvas(frontBaseImage.width, frontBaseImage.height);
  const frontCtx = frontCanvas.getContext('2d');

  // Draw base image
  frontCtx.drawImage(frontBaseImage, 0, 0);

  // Load and process photo
  const photoImage = await loadImage(
    path.resolve(__dirname, '..', '..', '..', '..', 'storage', employee.photo),
  );

  // Calculate new dimensions
  const originalWidth = photoImage.width;
  const originalHeight = photoImage.height;
  const newHeight = 330;
  const newWidth = Math.floor((newHeight * originalWidth) / originalHeight);

  // Calculate center position
  const centerX = Math.floor((frontCanvas.width - newWidth) / 2);

  // Draw photo on canvas
  frontCtx.drawImage(photoImage, centerX, 280, newWidth, newHeight);

  // Load front overlay and draw it
  const frontOverlay = await loadImage(
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'credentials',
      'front.png',
    ),
  );
  frontCtx.drawImage(frontOverlay, 0, 0);

  // Handle text wrapping for name
  const lines = wrapText(
    frontCtx,
    employee.name,
    frontCanvas.width - 100,
    font2,
  );
  let yText = lines.length === 1 ? 665 : 645;

  // Draw name text
  frontCtx.font = font2;
  frontCtx.fillStyle = black;

  for (const line of lines) {
    const centerX = (frontCanvas.width - frontCtx.measureText(line).width) / 2;
    frontCtx.fillText(line, centerX, yText);
    yText += 35;
  }

  // Draw job title
  frontCtx.font = font3;
  const jobCenterX =
    (frontCanvas.width - frontCtx.measureText(employee.position).width) / 2;
  frontCtx.fillText(employee.position, jobCenterX, 730);

  // Draw employee number
  frontCtx.font = font1;
  frontCtx.fillStyle = white;
  const numberCenterX =
    (frontCanvas.width - frontCtx.measureText(employee.noEmpleado).width) / 2;
  frontCtx.fillText(employee.noEmpleado, numberCenterX, 820);

  // Draw date
  const date = format(new Date(employee.admissionDate), 'dd/MM/yyyy');
  frontCtx.font = font5;
  const dateCenterX =
    (frontCanvas.width - frontCtx.measureText(date).width) / 2;
  2;
  frontCtx.fillText(date, dateCenterX, 917);

  // Create temporary buffer for front image
  const frontBuffer = frontCanvas.toBuffer('image/jpeg');

  // ------------- BACK SIDE -------------

  // Load back image
  const backImage = await loadImage(
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'credentials',
      'back.png',
    ),
  );

  // Create canvas for back side
  const backCanvas = createCanvas(backImage.width, backImage.height);
  const backCtx = backCanvas.getContext('2d');

  // Draw back image
  backCtx.drawImage(backImage, 0, 0);

  // Draw text labels
  backCtx.font = font6;
  backCtx.fillStyle = black;
  backCtx.fillText('CTA:', 70, 180);
  backCtx.fillText('NSS:', 70, 270);
  backCtx.fillText('T.SANGRE:', 70, 360);
  backCtx.fillText('RFC:', 70, 450);
  backCtx.fillText('CURP:', 70, 540);

  // Draw text values
  backCtx.font = font7;
  backCtx.fillText(employee.account, 150, 180);
  backCtx.fillText(employee.nss, 150, 270);
  backCtx.fillText(employee.blood, 243, 360);
  backCtx.fillText(employee.rfc, 148, 450);
  backCtx.fillText(employee.curp, 173, 540);

  // Draw emergency contact info
  const emergencyTitle = 'En caso de emergencia llamar a:';
  backCtx.font = font1;
  const emergencyCenterX =
    (backCanvas.width - backCtx.measureText(emergencyTitle).width) / 2;
  backCtx.fillText(emergencyTitle, emergencyCenterX, 630);

  const emergencyContact = `${employee.emergencyContact} / ${employee.emergencyNumber}`;
  backCtx.font = font7;
  const emergencyContactCenterX =
    (backCanvas.width - backCtx.measureText(emergencyContact).width) / 2;
  backCtx.fillText(emergencyContact, emergencyContactCenterX, 665);

  // Create temporary buffer for back image
  const backBuffer = backCanvas.toBuffer('image/jpeg');

  // ------------- COMBINED PAPER -------------
  // Load paper template
  const paperImage = await loadImage(
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      'credentials',
      'paper.jpg',
    ),
  );

  // Load front and back images from buffers
  const frontImage = await loadImage(frontBuffer);
  const backFinalImage = await loadImage(backBuffer);

  // Create canvas for paper
  const paperCanvas = createCanvas(paperImage.width, paperImage.height);
  const paperCtx = paperCanvas.getContext('2d');

  // Draw paper template
  paperCtx.drawImage(paperImage, 0, 0);

  // Draw front and back images
  paperCtx.drawImage(frontImage, 0, 0);
  paperCtx.drawImage(backFinalImage, 610, 0);

  // Return the final buffer
  return paperCanvas.toBuffer('image/jpeg');
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
