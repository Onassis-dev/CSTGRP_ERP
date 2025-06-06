import { format } from 'date-fns';
import { PDFImage, PDFPage, rgb } from 'pdf-lib';
import { PDFFont } from 'pdf-lib';
import { numberToWords } from 'src/routes/HR/documents/documents.utils';
import { fillBox } from 'src/utils/pdf';

export function generateOrder(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  data: Record<string, any>,
  logo: PDFImage,
) {
  const leftMargin = 45;
  const topMargin = page.getHeight() - 45;
  const rightMargin = page.getWidth() - 45;

  page.drawImage(logo, {
    x: leftMargin,
    y: topMargin - (logo.height * 110) / logo.width,
    width: 110,
    height: (logo.height * 110) / logo.width,
  });

  const rightProps = {
    page,
    font,
    size: 9,
    height: 9,
    color: rgb(0, 0, 0),
    x: rightMargin - 150,
    width: 150,
    align: 'right' as const,
  };

  const leftProps = {
    page,
    font,
    size: 9,
    height: 9,
    color: rgb(0, 0, 0),
    width: 300,
    x: leftMargin,
  };

  // Order
  fillBox({
    ...rightProps,
    text: 'ORDEN DE COMPRA',
    font: font,
    size: 12,
    y: 735,
  });

  fillBox({
    ...rightProps,
    text: 'No. Orden: ' + data.folio,
    y: 730 - 1 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'Fecha: ' + format(data.created_at, 'dd/MM/yyyy'),
    y: 730 - 2 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'Moneda: ' + data.currency,
    y: 730 - 3 * 12,
  });

  // Company
  fillBox({
    ...rightProps,
    text: 'Direccion de entrega:',
    font: font,
    size: 12,
    y: 635,
  });

  fillBox({
    ...rightProps,
    text: 'BC PET TREATS S DE RL DE CV',
    y: 630 - 1 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'Calle 6 Oriente #134 CD Industrial Tijuana B.C, C.P 22444',
    y: 630 - 2 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'Comprador: Aracely Varguez',
    y: 619 - 3 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'Correo: compras@bcpet.mx',
    y: 619 - 4 * 12,
  });

  fillBox({
    ...rightProps,
    text: 'RFC: SALO120101',
    y: 619 - 5 * 12,
  });

  // Supplier
  fillBox({
    ...leftProps,
    text: 'Proveedor:',
    font: bold,
    size: 12,
    y: 635,
  });

  fillBox({
    ...leftProps,
    text: data.supplier.name || '',
    y: 630 - 1 * 12,
  });

  fillBox({
    ...leftProps,
    text: 'Contacto: ' + data.supplier.atention || '',
    y: 630 - 2 * 12,
  });

  fillBox({
    ...leftProps,
    text: 'Correo: ' + data.supplier.email || '',
    y: 630 - 3 * 12,
  });

  fillBox({
    ...leftProps,
    text: 'Tel: ' + data.supplier.phone || '',
    y: 630 - 4 * 12,
  });

  fillBox({
    ...leftProps,
    text: 'RFC: ' + data.supplier.document,
    y: 630 - 5 * 12,
  });

  fillBox({
    ...leftProps,
    text: data.supplier.direction || '',
    y: 630 - 6 * 12,
  });

  // Products

  const columnsX = {
    noParte: leftMargin + 10,
    description: leftMargin + 100,
    quantity: leftMargin + 360,
    price: leftMargin + 410,
    total: leftMargin + 465,
  };

  fillBox({
    x: columnsX.noParte,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: 'No. Parte',
    font,
    page,
  });

  fillBox({
    x: columnsX.description,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: 'Descripción',
    font,
    page,
  });

  fillBox({
    x: columnsX.quantity,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: 'Cantidad',
    font,
    page,
  });

  fillBox({
    x: columnsX.price,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: 'Precio',
    font,
    page,
  });

  fillBox({
    x: columnsX.total,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: 'Importe',
    font,
    page,
  });

  let y = 500;

  data.products.forEach((product: any) => {
    const codeLines = fillBox({
      x: columnsX.noParte,
      y,
      size: 8,
      width: columnsX.description - columnsX.noParte - 6,
      height: 8,
      text: product.code || '',
      font,
      page,
    });

    const descriptionLines = fillBox({
      x: columnsX.description,
      y,
      size: 8,
      width: columnsX.quantity - columnsX.description - 6,
      height: 8,
      text: product.description || '',
      font,
      page,
    });

    fillBox({
      x: columnsX.quantity,
      y,
      size: 8,
      width: columnsX.price - columnsX.quantity - 6,
      height: 8,
      text: `${product.quantity} ${product.measurement}`,
      font,
      page,
    });

    fillBox({
      x: columnsX.price,
      y,
      size: 8,
      width: columnsX.total - columnsX.price - 6,
      height: 8,
      text: `$${Number(product.price).toFixed(3)}`,
      font,
      page,
    });

    fillBox({
      x: columnsX.total,
      y,
      size: 8,
      width: rightMargin - columnsX.total - 6,
      height: 8,
      text: `$${Number(product.total).toFixed(3)}`,
      font,
      page,
    });

    if (codeLines > 1 || descriptionLines > 1) {
      y -= 22;
    } else {
      y -= 16;
    }
  });

  const height = 530 - y - 5;

  page.drawRectangle({
    x: leftMargin,
    y: 530 - height,
    width: page.getWidth() - leftMargin * 2,
    height,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  fillBox({
    x: leftMargin,
    y: y - 40,
    size: 10,
    width: 200,
    height: 10,
    text: 'IMPORTE EN LETRA',
    font,
    page,
  });

  fillBox({
    x: leftMargin,
    y: y - 60,
    size: 10,
    width: 360,
    height: 10,
    text: numberToWords(Number(String(data.total).split('.')[0])),
    font,
    page,
  });

  fillBox({
    x: 455,
    y: y - 30,
    size: 10,
    width: 100,
    height: 10,
    text: 'Subtotal:',
    font,
    page,
  });

  fillBox({
    x: 455,
    y: y - 45,
    size: 10,
    width: 100,
    height: 10,
    text: `IVA ${Number(data.iva).toFixed(0)}%:`,
    font,
    page,
  });

  fillBox({
    x: 455,
    y: y - 60,
    size: 10,
    width: 100,
    height: 10,
    text: `Total:`,
    font,
    page,
  });

  fillBox({
    x: rightMargin - 60,
    y: y - 30,
    size: 10,
    width: 60,
    height: 10,
    text: `$${Number(data.net).toFixed(2)}`,
    font,
    page,
    align: 'right',
  });

  fillBox({
    x: rightMargin - 60,
    y: y - 45,
    size: 10,
    width: 60,
    height: 10,
    text: `$${Number(data.tax).toFixed(2)}`,
    font,
    page,
    align: 'right',
  });

  fillBox({
    x: rightMargin - 60,
    y: y - 60,
    size: 10,
    width: 60,
    height: 10,
    text: `$${Number(data.total).toFixed(2)}`,
    font,
    page,
    align: 'right',
  });

  fillBox({
    x: leftMargin,
    y: y - 100,
    size: 10,
    width: page.getWidth() - leftMargin * 2,
    height: 10,
    text: data.comments || '',
    font,
    page,
  });

  fillBox({
    x: leftMargin,
    y: 60,
    size: 8,
    width: page.getWidth() - leftMargin * 2,
    height: 8,
    text: 'HORARIO DE CONTRARECIBOS: LOS DIAS LUNES DE 11:AM A 1:00PM ANEXAR COPIA DE ORDEN DE LA COMPRA Al ENTREGAR LOS ARTICULOS Y/O MATERIALES EN ALMACEN DE REFACCIONES, ANEXAR COPIA DE ORDEN DE LA COMPRA',
    font,
    page,
  });
}
