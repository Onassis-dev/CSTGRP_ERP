import { format } from 'date-fns';
import { PDFFont, PDFPage } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';

export function drawAlta(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  fillBox({
    page,
    font,
    text: data.noEmpleado || '',
    x: 110,
    y: 698,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: 'X',
    x: 340,
    y: 698,
    size: 12,
    width: 12,
    height: 12,
  });

  fillBox({
    page,
    font,
    text: data.name + ' ' + data.paternalLastName + ' ' + data.maternalLastName,
    x: 80,
    y: 665,
    size: 9,
    width: 250,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.admissionDate, 'dd/MM/yyyy'),
    x: 430,
    y: 665,
    size: 9,
    width: 250,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.number || '',
    x: 420,
    y: 647,
    size: 9,
    width: 250,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.direction || '',
    x: 90,
    y: 645,
    size: 7,
    width: 250,
    height: 15,
  });

  fillBox({
    page,
    font,
    text: data.curp || '',
    x: 70,
    y: 613,
    size: 9,
    width: 200,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.rfc || '',
    x: 390,
    y: 613,
    size: 9,
    width: 200,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.civilStatus || '',
    x: 435,
    y: 630,
    size: 9,
    width: 200,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.bornLocation || '',
    x: 95,
    y: 585,
    size: 9,
    width: 90,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.bornDate, 'dd/MM/yyyy'),
    x: 250,
    y: 585,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.nss,
    x: 390,
    y: 585,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.clinicNo || '',
    x: 550,
    y: 585,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.email || '',
    x: 340,
    y: 473,
    size: 9,
    width: 200,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: `${data.position}, ${data.area}`,
    x: 105,
    y: 514,
    size: 7,
    width: 100,
    height: 14,
  });
}

export function drawBaja(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  fillBox({
    page,
    font,
    text: data.noEmpleado,
    x: 110,
    y: 698,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: 'X',
    x: 382,
    y: 698,
    size: 12,
    width: 12,
    height: 12,
  });

  fillBox({
    page,
    font,
    text: data.nss || '',
    x: 320,
    y: 395,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.position || '',
    x: 73,
    y: 370,
    size: 9,
    width: 105,
    height: 20,
  });

  fillBox({
    page,
    font,
    text: format(data.quitDate, 'dd/MM/yyyy'),
    x: 325,
    y: 412,
    size: 9,
    width: 150,
    height: 9,
  });

  if (data.quitStatus === 'RECONTRATABLE') {
    fillBox({
      page,
      font,
      text: 'X',
      x: 150,
      y: 310,
      size: 12,
      width: 12,
      height: 12,
    });
  } else {
    fillBox({
      page,
      font,
      text: 'X',
      x: 194,
      y: 310,
      size: 12,
      width: 12,
      height: 12,
    });
  }
}
