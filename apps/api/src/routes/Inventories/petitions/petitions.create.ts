import { PDFPage, PDFFont } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';
import { format, toZonedTime } from 'date-fns-tz';

export const fillRequisition = (
  page: PDFPage,
  font: PDFFont,
  requisition: any,
  position: 'top' | 'bottom',
) => {
  let addY = 0;
  if (position === 'bottom') addY = -386;

  fillBox({
    page,
    font,
    text: requisition.folio.toString(),
    size: 12,
    x: 467,
    y: 672 + addY,
    width: 100,
    height: 25,
    align: 'center',
  });

  if (requisition.jobs.startsWith(',') && requisition.jobs.endsWith(','))
    requisition.jobs = requisition.jobs.substring(
      1,
      requisition.jobs.length - 1,
    );
  requisition.jobs = requisition.jobs.replaceAll(',', ', ');

  fillBox({
    page,
    font,
    text: requisition.jobs,
    size: 12,
    x: 92,
    y: 555 + addY,
    width: 380,
    height: 27,
  });

  fillBox({
    page,
    font,
    text: requisition.code,
    size: 12,
    x: 92,
    y: 517 + addY,
    width: 140,
    height: 35,
  });

  fillBox({
    page,
    font,
    text: requisition.description,
    size: 8,
    x: 298,
    y: 512 + addY,
    width: 160,
    height: 35,
    maxLines: 3,
  });

  fillBox({
    page,
    font,
    text: requisition.petitioner,
    size: 12,
    x: 95,
    y: 637 + addY,
    width: 260,
    height: 30,
  });

  fillBox({
    page,
    font,
    text: requisition.area,
    size: 12,
    x: 435,
    y: 637 + addY,
    width: 130,
    height: 30,
  });

  fillBox({
    page,
    font,
    text:
      String(requisition.necesary).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      ' ' +
      requisition.measurement,
    size: 11,
    x: 470,
    y: 537 + addY,
    width: 90,
    height: 28,
    align: 'center',
  });

  fillBox({
    page,
    font,
    text:
      String(requisition.requested).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      ' ' +
      requisition.measurement,
    size: 11,
    x: 470,
    y: 490 + addY,
    width: 90,
    height: 28,
    align: 'center',
  });

  fillBox({
    page,
    font,
    text: format(
      toZonedTime(requisition.created_at, 'America/Tijuana'),
      'dd/MM/yyyy',
    ),
    size: 12,
    x: 170,
    y: 675 + addY,
    width: 140,
    height: 40,
  });

  fillBox({
    page,
    font,
    text: format(
      toZonedTime(requisition.created_at, 'America/Tijuana'),
      'HH:mm',
    ),
    size: 12,
    x: 380,
    y: 675 + addY,
    width: 80,
    height: 40,
    align: 'center',
  });

  const motivesPosition = {
    Empaque: 276,
    Producción: 196,
    'Corte de tela': 352,
    'Cortes varios': 452,
  };

  page.drawText('X', {
    x: motivesPosition[requisition.motive],
    y: 606 + addY,
    size: 12,
  });
};
