import { parseNumber } from 'src/utils/parseData';
import { File } from '@nest-lab/fastify-multer';
import * as pdfjsLib from 'pdfjs-dist';
import sql from 'src/utils/db';

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

export async function processJob(text: string) {
  let jobpo = '';
  let part = '';
  let amount = '';
  let description = '';
  let perBox = 0;

  const linesArray = text.split(/\s{3,}| {2}/);

  // Debugging;
  // linesArray.forEach((line, i) => {
  //   if (i < 1000) console.log(line);
  // });

  const startMaterialsIndex = linesArray.findIndex((line: any) =>
    line.includes('RAW MATERIAL COMPONENTS:'),
  );
  const startOperationsIndex = linesArray.findIndex((line: any) =>
    line.includes('OPERATIONS'),
  );
  const startDestinationsIndex = linesArray.findIndex((line: any) =>
    line.includes('SHIPPING SCHEDULE:'),
  );

  // Get general info
  jobpo =
    linesArray[linesArray.findIndex((line: any) => line.includes('Job:')) + 1];

  part = linesArray[linesArray.findIndex((line: any) => line === 'Part:') + 1];

  description =
    linesArray[
      linesArray.findIndex((line: any) => line.includes('Description:')) + 1
    ];

  const amountsStart = linesArray.findIndex((line: any) =>
    line.includes('Schedule Dates'),
  );
  amount = (
    Number(linesArray[amountsStart + 1].replaceAll(',', '')) +
    Number(linesArray[amountsStart + 3].replaceAll(',', ''))
  ).toFixed(0);

  if (part[0] === 'F') perBox = 20;
  if (part.startsWith('F6H') || part.startsWith('F6A')) perBox = 13;

  const boxesIndex = linesArray.findIndex(
    (line: string) => line.includes('KRAFT') || line.includes('CORRUGATED'),
  );
  if (boxesIndex !== -1) {
    for (let i = boxesIndex; i < boxesIndex + 10; i++) {
      if (/^\d+(\.\d{2})$/.test(linesArray[i])) {
        perBox = Number(amount) / Number(linesArray[i]);
        break;
      }
    }
  }

  const dateStr =
    linesArray[
      linesArray.findIndex((line: any) => line.includes('Due Date:')) + 1
    ];

  const [month, day, year] = dateStr.split('/');
  let due: any = new Date();

  due.setFullYear(year);
  due.setMonth(parseInt(month) - 1);
  due.setDate(day);
  due = due.toISOString().split('T')[0];

  // Get destinations
  const destinations = [];

  if (startDestinationsIndex !== -1) {
    const destinationsLines = linesArray.slice(
      startDestinationsIndex,
      startMaterialsIndex,
    );

    destinationsLines.forEach((line: any, i: number) => {
      if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(line) &&
        /^\d+$/.test(destinationsLines[i + 1])
      ) {
        destinations.push({
          date: destinationsLines[i],
          so: destinationsLines[i + 1],
          po: destinationsLines[i + 10].replace(/\D/g, ''),
          amount: destinationsLines[i + 4],
        });
      }
    });
  }

  // Get materials
  const materialsLines = linesArray.slice(
    startMaterialsIndex,
    startOperationsIndex,
  );
  const materials: Array<any> = [];

  let materialNumber = 0;
  materialsLines.forEach((element: any, i: number) => {
    // Materiales
    if (/^\d{2,3}$/.test(element) && Number(element) > Number(materialNumber)) {
      materialNumber = parseInt(element);
      const excludedValues = ['PATTERN', 'SAMPLE', 'IS', 'FREIGHT', 'SCRN'];
      if (
        !excludedValues.some((substring) =>
          materialsLines[i + 1].includes(substring),
        )
      ) {
        const material = {
          code: materialsLines[i + 1],
          amount: '',
          realAmount: '',
          active: false,
        };

        for (let j = 2; j < 9; j++) {
          if (
            !isNaN(parseNumber(materialsLines[i + j])) &&
            !/\d/.test(materialsLines[i + j + 1])
          ) {
            material.amount = materialsLines[i + j].replace(/,/g, '');
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

  // Get operations
  const operationsLines = linesArray.slice(startOperationsIndex, -1);
  const operations: Array<any> = [];

  operationsLines.forEach((text: any, i: number) => {
    if (text.includes('CrewSize')) {
      for (let j = i; j < i + 200; j++) {
        if (/^(\d+,)*\d+\.\d{5}$/.test(operationsLines[j])) {
          let crewSize = 1;
          for (let k = j; k < j + 10; k++) {
            if (/^\d{2}\/\d{2}\/\d{4}\s\d+\.\d{2}$/.test(operationsLines[k])) {
              crewSize = Number(operationsLines[k].split(' ')[1]);
            }
          }

          operations.push({
            code: operationsLines[j - 2],
            minutes: (
              (Number(operationsLines[j + 2].replaceAll(',', '')) +
                Number(operationsLines[j + 3].replaceAll(',', ''))) *
              60 *
              crewSize
            ).toFixed(2),
            area: 'produccion',
          });
          break;
        }
      }
    }
  });

  const [{ clientId }] =
    await sql`select id as "clientId" from clients where name = 'CSI'`;

  return {
    materials,
    jobpo,
    due,
    part,
    amount,
    operations,
    clientId,
    description,
    destinations,
    perBox,
  };
}
