import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { PDFImage, PDFPage, rgb } from 'pdf-lib';
import { PDFFont } from 'pdf-lib';
import {
  numberToWordsEN,
  numberToWordsES,
} from 'src/routes/HR/documents/documents.utils';
import { fillBox } from 'src/utils/pdf';
import { formatNumber } from './orders.utils';
import { HttpException } from '@nestjs/common';

type Lang = 'es' | 'en';
const businessList = {
  1: {
    name: 'BC PET TREATS S DE RL DE CV',
    address: 'Calle 6 Oriente #134 CD Industrial Tijuana B.C, C.P 22444',
    rfc: 'BPT130606JY0',
    email: 'compras@bcpet.mx',
    lang: 'es' as Lang,
    buyer: 'Aracely Varguez',
  },
  2: {
    name: 'MPM BAJA S DE RL DE CV',
    address: 'Calle Dos Oriente #134 CD Industrial Tijuana B.C, C.P 22444',
    rfc: 'MBA231027MP6',
    email: 'compras@mpmtj.com',
    lang: 'es' as Lang,
    buyer: 'Aracely Varguez',
  },
  3: {
    name: 'CST',
    address: 'Calle Dos Oriente #134 CD Industrial Tijuana B.C, C.P 22444',
    billAddress: '2364 Paseo de las Americas #104-1009 San Diego, CA 92154',
    lang: 'en' as Lang,
  },
};

const destinations = {
  apex: {
    name: 'M&M APEX SERVICES',
    address: 'At`n Pablo Reyna 1701 Landmark RD San Diego, CA 92154',
  },
  mpm: {
    name: 'MPM BAJA S DE RL DE CV',
    address: 'Calle Dos Oriente #134 CD Industrial Tijuana B.C, C.P 22444',
  },
};

const translations = {
  orderTitle: {
    es: 'ORDEN DE COMPRA',
    en: 'PURCHASE ORDER',
  },
  orderNo: {
    es: 'No. Orden:',
    en: 'Order No:',
  },
  date: {
    es: 'Fecha:',
    en: 'Date:',
  },
  currency: {
    es: 'Moneda:',
    en: 'Currency:',
  },
  provider: {
    es: 'Proveedor:',
    en: 'Provider:',
  },
  contact: {
    es: 'Contacto:',
    en: 'Contact:',
  },
  email: {
    es: 'Correo:',
    en: 'Email:',
  },
  phone: {
    es: 'Tel:',
    en: 'Phone:',
  },
  deliveryAddress: {
    es: 'Direccion de entrega:',
    en: 'Ship To:',
  },
  buyer: {
    es: 'Comprador:',
    en: 'Buyer:',
  },
  noParte: {
    es: 'No. Parte',
    en: 'Part No.',
  },
  description: {
    es: 'Descripción',
    en: 'Description',
  },
  quantity: {
    es: 'Cantidad',
    en: 'Quantity',
  },
  price: {
    es: 'Precio',
    en: 'Price',
  },
  importe: {
    es: 'Importe',
    en: 'Amount',
  },
  subtotal: {
    es: 'Subtotal:',
    en: 'Subtotal:',
  },
  vat: {
    es: 'IVA',
    en: 'VAT',
  },
  total: {
    es: 'Total:',
    en: 'Total:',
  },
  dollars: {
    es: 'Dolares',
    en: 'Dollars',
  },
  pesos: {
    es: 'Pesos',
    en: 'Pesos',
  },
  billAddress: {
    es: 'Direccion de facturacion:',
    en: 'Bill To:',
  },
  importeEnLetra: {
    es: 'IMPORTE EN LETRA',
    en: 'AMOUNT IN WORDS',
  },
} as const;

const formatDate = (date: string, lang: Lang) => {
  if (lang === 'es')
    return format(toZonedTime(date, 'America/Tijuana'), 'dd/MM/yyyy');
  if (lang === 'en')
    return format(toZonedTime(date, 'America/Tijuana'), 'MM/dd/yyyy');
  return '';
};
type TranslationKey = keyof typeof translations;

function getTranslations(lang: Lang) {
  return (key: TranslationKey) => translations[key][lang];
}

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
    y: topMargin - 85,
    width: 85 * (logo.width / logo.height),
    height: 85,
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

  const business = businessList[data.business];
  const t = getTranslations(business.lang);

  if (!business) throw new HttpException('Error: (Empresa no encontrada)', 400);

  if (!t) throw new HttpException('Error: (Idioma no encontrado)', 400);

  // Order
  fillBox({
    ...rightProps,
    text: t('orderTitle'),
    font: font,
    size: 12,
    y: 735,
  });

  fillBox({
    ...rightProps,
    text: t('orderNo') + ' ' + data.ref,
    y: 730 - 1 * 12,
  });

  fillBox({
    ...rightProps,
    text: t('date') + ' ' + formatDate(data.created_at, business.lang),
    y: 730 - 2 * 12,
  });

  fillBox({
    ...rightProps,
    text: t('currency') + ' ' + data.currency,
    y: 730 - 3 * 12,
  });

  // Company
  fillBox({
    ...rightProps,
    text: t('deliveryAddress'),
    font: font,
    size: 12,
    y: 635,
  });

  let destinationName = '';
  let destinationAddress = '';
  if (business.lang === 'es') {
    destinationName = business.name;
    destinationAddress = business.address;
  } else {
    destinationName = destinations[data.address].name;
    destinationAddress = destinations[data.address].address;
  }
  fillBox({
    ...rightProps,
    text: destinationName,
    y: 630 - 1 * 12,
  });

  fillBox({
    ...rightProps,
    text: destinationAddress,
    y: 630 - 2 * 12,
  });

  if (business.buyer) {
    fillBox({
      ...rightProps,
      text: t('buyer') + ' ' + business.buyer,
      y: 619 - 3 * 12,
    });
  }

  if (business.email) {
    fillBox({
      ...rightProps,
      text: t('email') + ' ' + business.email,
      y: 619 - 4 * 12,
    });
  }

  if (business.lang === 'es') {
    fillBox({
      ...rightProps,
      text: `RFC: ${business.rfc}`,
      y: 619 - 5 * 12,
    });
  }

  if (business.billAddress) {
    fillBox({
      ...rightProps,
      text: t('billAddress'),
      font: font,
      size: 12,
      y: 575,
    });

    fillBox({
      ...rightProps,
      text: business.billAddress,
      y: 586 - 2 * 12,
    });
  }

  // Supplier
  fillBox({
    ...leftProps,
    text: t('provider'),
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
    text: data.supplier.atention
      ? `${t('contact')} ${data.supplier.atention}`
      : '',
    y: 630 - 2 * 12,
  });

  fillBox({
    ...leftProps,
    text: data.supplier.email ? `${t('email')} ${data.supplier.email}` : '',
    y: 630 - 3 * 12,
  });

  fillBox({
    ...leftProps,
    text: data.supplier.phone ? `${t('phone')} ${data.supplier.phone}` : '',
    y: 630 - 4 * 12,
  });

  if (data.supplier.document) {
    fillBox({
      ...leftProps,
      text: 'RFC: ' + data.supplier.document,
      y: 630 - 5 * 12,
    });
  }

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
    text: t('noParte'),
    font,
    page,
  });

  fillBox({
    x: columnsX.description,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: t('description'),
    font,
    page,
  });

  fillBox({
    x: columnsX.quantity,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: t('quantity'),
    font,
    page,
  });

  fillBox({
    x: columnsX.price,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: t('price'),
    font,
    page,
  });

  fillBox({
    x: columnsX.total,
    y: 515,
    size: 10,
    width: 100,
    height: 10,
    text: t('importe'),
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
      text: `$${formatNumber(product.price, 4)}`,
      font,
      page,
    });

    fillBox({
      x: columnsX.total,
      y,
      size: 8,
      width: rightMargin - columnsX.total - 6,
      height: 8,
      text: `$${formatNumber(product.total, 4)}`,
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
    text: t('importeEnLetra'),
    font,
    page,
  });

  const numbers = String(Number(data.total).toFixed(2)).split('.');
  const currencies = {
    USD: t('dollars'),
    MXN: t('pesos'),
  };

  let wordsOfNumber = '';
  if (business.lang === 'es') {
    wordsOfNumber =
      `${numberToWordsES(Number(numbers[0]))} ${currencies[data.currency]} ${numbers[1]}/100 ${data.currency}`.toUpperCase();
  } else {
    wordsOfNumber =
      `${numberToWordsEN(Number(numbers[0]))} ${currencies[data.currency]} ${numbers[1]}/100 ${data.currency}`.toUpperCase();
  }

  fillBox({
    x: leftMargin,
    y: y - 60,
    size: 10,
    width: 360,
    height: 10,
    text: wordsOfNumber,
    font,
    page,
  });

  if (business.lang === 'es') {
    fillBox({
      x: 455,
      y: y - 30,
      size: 10,
      width: 100,
      height: 10,
      text: t('subtotal'),
      font,
      page,
    });

    fillBox({
      x: 455,
      y: y - 45,
      size: 10,
      width: 100,
      height: 10,
      text: `IVA ${formatNumber(data.iva, 0)}%:`,
      font,
      page,
    });
  }

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

  if (business.lang === 'es') {
    fillBox({
      x: rightMargin - 60,
      y: y - 30,
      size: 10,
      width: 60,
      height: 10,
      text: `$${formatNumber(data.net)}`,
      font,
      page,
      align: 'right',
    });
  }

  if (business.lang === 'es') {
    fillBox({
      x: rightMargin - 60,
      y: y - 45,
      size: 10,
      width: 60,
      height: 10,
      text: `$${formatNumber(data.tax)}`,
      font,
      page,
      align: 'right',
    });
  }

  fillBox({
    x: rightMargin - 60,
    y: y - 60,
    size: 10,
    width: 60,
    height: 10,
    text: `$${formatNumber(data.total)}`,
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

  if (business.lang === 'es') {
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
}
