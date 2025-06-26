import { parseNumber } from 'src/utils/parseData';
import { File } from '@nest-lab/fastify-multer';
import * as pdfjsLib from 'pdfjs-dist';

export async function processPDF(pdfFile: File) {
  const pdfData = new Uint8Array(pdfFile.buffer);

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n');
}

export function processImport(text: string) {
  const linesArray: string[] = text.split(/\s{3,}| {2}/);
  const importNum =
    linesArray[
      linesArray.findIndex((line: string) => line.includes('Tracking :')) + 1
    ];
  let dateParts =
    linesArray[
      linesArray.findIndex((line: string) => line === '(mm/dd/yyyy) :') + 1
    ].split('/');

  if (dateParts.length !== 3) {
    dateParts =
      linesArray[
        linesArray.findIndex((line: string) => line === ':') + 1
      ].split('/');
  }
  const dueDate = [dateParts[2], dateParts[0], dateParts[1]].join('-');

  const materials: Array<object> = [];
  linesArray.forEach((element: string, i: number) => {
    if (element.includes('•')) {
      let code = linesArray[i + 1].replaceAll(' ', '');
      if (code.endsWith('-CA')) {
        code += linesArray[i + 2].replaceAll(' ', '');
      }
      if (code.substring(0, 4) !== 'CSI-') return;
      if (code.includes('ZEN')) return;
      if (code.includes('EAL-')) return;
      if (code.includes('ZP-')) return;
      if (code.length === 13 && code[12] === 'F') return;
      if (code.length === 15 && code[14] === 'M') return;

      let amount: number;
      for (let j = i; j < i + 20; j++) {
        if (
          !isNaN(parseNumber(linesArray[j].split(' ')[0])) &&
          !/\d/.test(linesArray[j].split(' ')[1]) &&
          linesArray[j].split(' ')[1] &&
          linesArray[j].split(' ')[1] !== '•'
        ) {
          amount = parseFloat(linesArray[j].split(' ')[0].replaceAll(',', ''));
          if (code.length === 13 && code[12] === 'M') {
            code = code.slice(0, -1);
            amount = amount * 2;
          }
          materials.push({ code, amount: amount.toString() });
          break;
        }
      }
    }
  });

  if (materials.length === 0) {
    throw new Error('Sin materiales');
  }

  return { dueDate, importNum, materials };
}

export function processJob(text: string) {
  let jobpo = '';
  let linesArray = text.split(/\s{3,}| {2}/);

  // Debugging
  // linesArray.forEach((line) => console.log(line));

  const index = linesArray.findIndex((line: any) =>
    line.includes('RAW MATERIAL COMPONENTS:'),
  );
  const endIndex = linesArray.findIndex((line: any) =>
    line.includes('OPERATIONS'),
  );

  jobpo =
    linesArray[linesArray.findIndex((line: any) => line.includes('Job:')) + 1];

  const dateStr =
    linesArray[
      linesArray.findIndex((line: any) => line.includes('Due Date:')) + 1
    ];

  const [month, day, year] = dateStr.split('/');
  let dueDate: any = new Date();

  dueDate.setFullYear(year);
  dueDate.setMonth(parseInt(month) - 1);
  dueDate.setDate(day);
  dueDate = dueDate.toISOString().split('T')[0];

  linesArray = linesArray.slice(index, endIndex);
  const materials: Array<any> = [];

  let materialNumber = 0;
  linesArray.forEach((element: any, i: number) => {
    // Materiales
    if (/^\d{2,3}$/.test(element) && Number(element) > Number(materialNumber)) {
      materialNumber = parseInt(element);
      const excludedValues = ['PATTERN', 'SAMPLE', 'IS', 'FREIGHT', 'SCRN'];
      if (
        !excludedValues.some((substring) =>
          linesArray[i + 1].includes(substring),
        )
      ) {
        const material = {
          code: linesArray[i + 1],
          amount: '',
          realAmount: '',
          active: false,
        };

        for (let j = 2; j < 9; j++) {
          if (
            !isNaN(parseNumber(linesArray[i + j])) &&
            !/\d/.test(linesArray[i + j + 1])
          ) {
            material.amount = linesArray[i + j].replace(/,/g, '');
            material.realAmount = material.amount;
            break;
          }
        }

        materials.push(material);
      }
    }
  });

  materials.forEach((material, i) => {
    materials[i].code =
      material.code[0] === 'P' ? 'CSI-' + material.code : material.code;
  });

  return { materials, jobpo, dueDate };
}
