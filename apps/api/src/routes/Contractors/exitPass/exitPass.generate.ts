import { PDFPage, PDFFont } from 'pdf-lib';
import { fillBox } from 'src/utils/pdf';
import { format } from 'date-fns';

export const fillExitPass = (page: PDFPage, font: PDFFont, data: any) => {
  for (let i = 0; i < 2; i++) {
    const addY = i * -380;

    fillBox({
      page,
      font,
      text: String(data.folio),
      size: 12,
      x: 475,
      y: 685 + addY,
      width: 100,
      height: 25,
      align: 'center',
    });
    fillBox({
      page,
      font,
      text: format(data.date, 'dd/MM/yyyy'),
      size: 12,
      x: 480,
      y: 732 + addY,
      width: 100,
      height: 25,
      align: 'center',
    });
    fillBox({
      page,
      font,
      text: 'X',
      size: 14,
      x: -7,
      y: 702 + addY,
      width: 100,
      height: 25,
      align: 'center',
    });
    fillBox({
      page,
      font,
      text: data.contractor,
      size: 12,
      x: 92,
      y: 650 + addY,
      width: 130,
      height: 25,
      align: 'center',
    });

    let rowY = 563 + addY;
    for (const job of data.jobs) {
      fillBox({
        page,
        font,
        text: String(job.contractorAmount),
        size: 12,
        x: 35,
        y: rowY,
        width: 55,
        height: 25,
        align: 'center',
      });

      fillBox({
        page,
        font,
        text: String(job.description),
        size: 12,
        x: 95,
        y: rowY,
        width: 235,
        height: 25,
        oneLine: true,
        align: 'center',
      });

      fillBox({
        page,
        font,
        text: job.ref,
        size: 12,
        x: 420,
        y: rowY,
        width: 140,
        height: 25,
        align: 'center',
      });

      rowY -= 17;
    }
  }
};
