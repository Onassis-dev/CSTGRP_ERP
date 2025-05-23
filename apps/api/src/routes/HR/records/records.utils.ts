import { format as formatDateFns, getISOWeek } from 'date-fns';
import { PDFFont, PDFPage } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';

function format(date: string, format: string = 'dd/MM/yyyy') {
  if (!date) return '';
  return formatDateFns(new Date(date), format);
}

function drawBasicInfo(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  fillBox({
    page,
    font,
    text: data.noEmpleado || '',
    x: 110,
    y: 699,
    size: 9,
    width: 100,
    height: 9,
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
    text: format(data.admissionDate),
    x: 430,
    y: 665,
    size: 9,
    width: 250,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.formatDate),
    x: 510,
    y: 730,
    size: 12,
    width: 100,
    height: 12,
  });
}

export function drawAlta(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  drawBasicInfo(page, font, data);

  fillBox({
    page,
    font,
    text: 'X',
    x: 340,
    y: 699,
    size: 12,
    width: 12,
    height: 12,
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
    text: format(data.bornDate),
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
    y: 472,
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

  fillBox({
    page,
    font,
    text: String(data.nominaSalary) || '',
    x: 415,
    y: 565,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.department || '',
    x: 260,
    y: 514,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.boss || '',
    x: 475,
    y: 514,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.emergencyNumber || '',
    x: 200,
    y: 472,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.emergencyContact || '',
    x: 170,
    y: 447,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.emergencyRelationship || '',
    x: 430,
    y: 447,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: String(getISOWeek(new Date(data.admissionDate))) || '',
    x: 200,
    y: 496,
    size: 9,
    width: 100,
    height: 9,
  });

  if (data.infonavitNo) {
    fillBox({
      page,
      font,
      text: data.infonavitNo,
      x: 258,
      y: 567,
      size: 9,
      width: 100,
      height: 9,
    });
  }
  fillBox({
    page,
    font,
    text: 'X',
    x: data.infonavitNo ? 150 : 194,
    y: 567,
    size: 12,
    width: 12,
    height: 12,
  });

  if (data.account) {
    fillBox({
      page,
      font,
      text: data.account,
      x: 258,
      y: 549,
      size: 9,
      width: 100,
      height: 9,
    });
  }
  fillBox({
    page,
    font,
    text: 'X',
    x: data.account ? 150 : 194,
    y: 549,
    size: 12,
    width: 12,
    height: 12,
  });

  if (data.fonacotNo) {
    fillBox({
      page,
      font,
      text: data.fonacotNo,
      x: 258,
      y: 531,
      size: 9,
      width: 100,
      height: 9,
    });
  }
  fillBox({
    page,
    font,
    text: 'X',
    x: data.fonacotNo ? 150 : 194,
    y: 531,
    size: 12,
    width: 12,
    height: 12,
  });
}

export function drawBaja(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  drawBasicInfo(page, font, data);

  fillBox({
    page,
    font,
    text: 'X',
    x: 382,
    y: 699,
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
    y: 371,
    size: 9,
    width: 105,
    height: 20,
  });

  fillBox({
    page,
    font,
    text: data.department || '',
    x: 222,
    y: 371,
    size: 9,
    width: 105,
    height: 20,
  });

  fillBox({
    page,
    font,
    text: data.boss || '',
    x: 368,
    y: 371,
    size: 9,
    width: 105,
    height: 20,
  });

  fillBox({
    page,
    font,
    text: String(getISOWeek(new Date(data.quitDate))) || '',
    x: 555,
    y: 371,
    size: 9,
    width: 105,
    height: 20,
  });

  fillBox({
    page,
    font,
    text: format(data.resignationDate),
    x: 145,
    y: 412,
    size: 9,
    width: 150,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.lastDay),
    x: 160,
    y: 394,
    size: 9,
    width: 150,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.quitNotes || '',
    x: 170,
    y: 341,
    size: 9,
    width: 400,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.quitDate),
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

  const motivePositions = {
    terminacion_de_contrato: 222,
    renuncia_voluntaria: 325,
    liquidacion: 412,
    baja_por_faltas: 512,
  };

  fillBox({
    page,
    font,
    text: 'X',
    x: motivePositions[data.quitReason],
    y: 360,
    size: 12,
    width: 12,
    height: 12,
  });
}

export function drawSalary(
  page: PDFPage,
  font: PDFFont,
  data: Record<string, any>,
) {
  drawBasicInfo(page, font, data);

  fillBox({
    page,
    font,
    text: 'X',
    x: 470,
    y: 699,
    size: 12,
    width: 12,
    height: 12,
  });

  fillBox({
    page,
    font,
    text: data.reasonComment || '',
    x: 383,
    y: 261,
    size: 9,
    width: 180,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: String(getISOWeek(new Date(data.changeDate))) || '',
    x: 159,
    y: 231,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: (data.oldSalary || 0).toFixed(2),
    x: 110,
    y: 244,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: (data.newSalary || 0).toFixed(2),
    x: 285,
    y: 244,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: format(data.changeDate) || '',
    x: 485,
    y: 244,
    size: 9,
    width: 100,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.petitioner || '',
    x: 270,
    y: 229,
    size: 9,
    width: 140,
    height: 9,
  });

  fillBox({
    page,
    font,
    text: data.comments || '',
    x: 165,
    y: 154,
    size: 9,
    width: 400,
    height: 9,
  });

  const motivePositions = {
    cambio_de_puesto: 260,
    antiguedad: 347,
    tabulador: 419,
    desempeño: 506,
    otro: 261,
  };

  fillBox({
    page,
    font,
    text: 'X',
    x: motivePositions[data.salaryReason],
    y: data.salaryReason === 'otro' ? 261 : 277,
    size: 12,
    width: 12,
    height: 12,
  });
}
