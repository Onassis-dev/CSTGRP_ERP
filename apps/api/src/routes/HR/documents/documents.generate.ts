import { differenceInYears, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFPage, rgb } from 'pdf-lib';
import { PDFFont } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';

export function generateApplication(
  page: PDFPage,
  page2: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  const baseProps = {
    page,
    font,
    size: 8,
    height: 8,
    color: rgb(0.2, 0.2, 0.2),
    width: 100,
  };

  fillBox({
    ...baseProps,
    text: format(data.bcpet, 'dd') || '',
    x: 395,
    y: 755,
    size: 9,
    height: 9,
    color: rgb(0, 0, 0),
  });

  fillBox({
    ...baseProps,
    text: format(data.bcpet, 'MMMM', { locale: es }) || '',
    x: 424,
    y: 755,
    size: 9,
    height: 9,
    color: rgb(0, 0, 0),
  });

  fillBox({
    ...baseProps,
    text: format(data.bcpet, 'yy', { locale: es }) || '',
    x: 510,
    y: 755,
    size: 9,
    height: 9,
    color: rgb(0, 0, 0),
  });

  fillBox({
    ...baseProps,
    text: data.maternalLastName || '',
    x: 35,
    y: 577,
  });

  fillBox({
    ...baseProps,
    text: data.paternalLastName || '',
    x: 190,
    y: 577,
  });

  fillBox({
    ...baseProps,
    text: data.name || '',
    x: 293,
    y: 577,
  });

  fillBox({
    ...baseProps,
    text: data.bornLocation || '',
    x: 26,
    y: 552,
  });

  fillBox({
    ...baseProps,
    text: format(data.bornDate, 'dd/MM/yyyy') || '',
    x: 148,
    y: 552,
  });

  fillBox({
    ...baseProps,
    text: String(differenceInYears(data.bcpet, data.bornDate)) || '',
    x: 243,
    y: 552,
  });

  fillBox({
    ...baseProps,
    text: data.civilStatus || '',
    x: 293,
    y: 552,
  });

  fillBox({
    ...baseProps,
    text: data.direction || '',
    x: 32,
    y: 526,
    width: 280,
    size: 7,
  });

  fillBox({
    ...baseProps,
    text: data.number || '',
    x: 345,
    y: 526,
    size: 7,
  });

  fillBox({
    ...baseProps,
    text: data.email || '',
    x: 398,
    y: 526,
    width: 140,
    size: 7,
  });

  fillBox({
    ...baseProps,
    text: data.nss || '',
    x: 26,
    y: 480,
  });

  fillBox({
    ...baseProps,
    text: data.rfc || '',
    x: 242,
    y: 480,
  });

  fillBox({
    ...baseProps,
    text: data.curp || '',
    x: 398,
    y: 480,
  });

  fillBox({
    ...baseProps,
    text: data.clinicNo || '',
    x: 196,
    y: 469,
  });

  fillBox({
    ...baseProps,
    text: 'X',
    x:
      data.genre?.toLowerCase() === 'm'
        ? 373
        : data.genre?.toLowerCase() === 'f'
          ? 428
          : -100,
    y: 552,
    color: rgb(0, 0, 0),
    size: 10,
    height: 10,
  });

  // Page 2
  fillBox({
    ...baseProps,
    page: page2,
    text: data.emergencyContact || '',
    x: 28,
    y: 516,
  });

  fillBox({
    ...baseProps,
    page: page2,
    text: data.emergencyRelationship || '',
    x: 194,
    y: 516,
  });

  fillBox({
    ...baseProps,
    page: page2,
    text: data.emergencyNumber || '',
    x: 296,
    y: 516,
  });
}
