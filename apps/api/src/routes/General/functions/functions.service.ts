import AdmZip from 'adm-zip';
import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import {
  processImport,
  processJob,
  processPDF,
} from 'src/routes/Inventories/various/various.utils';
import { File } from '@nest-lab/fastify-multer';
import { updateMaterialAmount } from 'src/utils/functions';
import { deleteFile, saveFile } from 'src/utils/storage';

dotenv.config();

@Injectable()
export class FunctionsService {
  async importInventory() {
    // Ruta del archivo
    const filePath = path.resolve(
      '/home/onassis/Downloads/CSI PROGRAMACIONES/CSTECH_CycleCount_May_2024 (inventario inicial del cliente).xlsx',
    );

    // Leer el archivo desde el sistema
    const fileBuffer = fs.readFileSync(filePath);

    // Cargar el archivo en ExcelJS
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(fileBuffer);

    const rows: any[] = wb
      .getWorksheet(1)
      .getRows(2, 10000)
      .map((row) => {
        return {
          code: row.getCell(1).value,
          description: row.getCell(2).value,
          amount: row.getCell(3).value,
          measurement: row.getCell(4).value,
          clientId: 3,
        };
      })
      .filter((item) => item.code)
      .map((e) => ({ ...e, code: 'CSI-' + e.code }));

    // Ejecutar transacciones en SQL
    await sql.begin(async (sql) => {
      await sql`delete from materialmovements`;
      await sql`delete from materials`;
      await sql`delete from materialie`;

      const [{ id }] =
        await sql`insert into materialie (import, due) values (1, '2024-01-01') returning id`;

      await sql`insert into materials ${sql(rows)}`;
      await sql`INSERT INTO materialmovements ("materialId", "movementId", amount, "realAmount", active)
        SELECT id, ${id}, amount, amount, true
        FROM materials;`;
    });

    return rows;
  }

  async importLocations(file: File) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(file.buffer);

    const rows: any[] = wb
      .getWorksheet(1)
      .getRows(2, 10000)
      .map((row) => {
        return {
          code: row.getCell(1).value,
          description: row.getCell(2).value,
          amount: row.getCell(3).value,
          measurement: row.getCell(4).value,
          location: row.getCell(5).value,
          clientId: 3,
        };
      })
      .filter((item) => item.code)
      .map((e) => ({ ...e, code: 'CSI-' + e.code }));

    console.log(rows);
    await sql.begin(async (sql) => {
      for (const row of rows) {
        await sql`update materials set location = ${row.location || ''} where code = ${row.code}`;
      }
    });

    return rows;
  }

  async update() {
    const materials = await sql`select id from materials`;
    for (const material of materials) {
      console.log(material.id);
      await updateMaterialAmount(material.id);
    }
  }

  async checkAll() {
    const movements = await sql`
      SELECT materialmovements.id, active
      FROM materialmovements
      JOIN materialie ON materialie.id = materialmovements."movementId"
      WHERE materialie.jobpo IS NOT NULL`;

    for (const body of movements) {
      await sql.begin(async (sql) => {
        const [movement] = await sql`
          UPDATE materialmovements
          SET active = true, "activeDate" = ${new Date()}
          WHERE id = ${body.id}
          RETURNING amount, "realAmount", "materialId"`;

        updateMaterialAmount(movement.materialId, sql);
      });
    }

    const newMovements = await sql`
      SELECT materialmovements.id, active
      FROM materialmovements
      JOIN materialie ON materialie.id = materialmovements."movementId"
      WHERE materialmovements.active <> true`;

    return newMovements;
  }

  async processAllJobs() {
    const directory =
      '/home/onassis/Downloads/CSI PROGRAMACIONES/Importaciones/exports/';
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileBuffer = fs.readFileSync(filePath);

      const pdfText = await processPDF({ buffer: fileBuffer } as File);

      const body = processJob(pdfText);

      ///
      const materials = body.materials.map((item: any) => item.code);

      const materialRows =
        await sql`SELECT code FROM materials WHERE code in ${sql(materials)}`;

      if (materialRows.length !== materials.length) {
        for (const material of body.materials) {
          const [materialExists] =
            await sql`select id from materials where code = ${material.code}`;
          if (!materialExists)
            await sql`insert into materials (code, description, measurement, amount, "minAmount", "clientId") values (${material.code}, '', 'PZ', 0, 0, 3)`;
        }
      }

      await sql`Select id from materials where code in (${sql(materials)})`;

      await sql.begin(async (sql) => {
        await sql`Insert into materialie (jobpo, programation, due) values (${body.jobpo}, ${1}, ${body.dueDate})`;

        for (const material of body.materials) {
          const [movement] =
            await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
             ((select Id from materials where code = ${material.code}),(select id from materialie where jobpo = ${body.jobpo}),${-Math.abs(parseFloat(material.amount))},${-Math.abs(parseFloat(material.amount))}, false, ${material.active ? new Date() : null}) returning "materialId"`;

          if (material.active)
            await updateMaterialAmount(movement.materialId, sql);
        }
      });
    }
  }

  async processAllImports() {
    const directory =
      '/home/onassis/Downloads/CSI PROGRAMACIONES/Importaciones/rvimports/';
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileBuffer = fs.readFileSync(filePath);

      const pdfText = await processPDF({ buffer: fileBuffer } as File);

      let body: {
        dueDate: string;
        importNum: string;
        materials: any[];
      };
      try {
        body = processImport(pdfText);
      } catch (err) {
        console.log('error: ' + file);
        continue;
      }

      const materials = [
        ...new Set(body.materials.map((item: any) => item.code)),
      ];

      await sql.begin(async (sql) => {
        const materialRows =
          await sql`SELECT code FROM materials WHERE code in ${sql(materials)}`;
        if (materialRows.length !== materials.length) {
          for (const material of body.materials) {
            const [materialExists] =
              await sql`select id from materials where code = ${material.code}`;
            if (!materialExists)
              await sql`insert into materials (code, description, measurement, amount, "minAmount", "clientId") values (${material.code}, '', 'PZ', 0, 0, 3)`;
          }
        }

        await sql`insert into materialie (import, due, location) values (${body.importNum}, ${body.dueDate}, 'At CST, Qtys verified')`;

        for (const material of body.materials) {
          const [movement] =
            await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
           ((select id from materials where code = ${material.code}),(select id from materialie where import = ${body.importNum}), ${Math.abs(parseFloat(material.amount))},${Math.abs(parseFloat(material.amount))}, true, ${new Date()}) returning "materialId"`;

          await updateMaterialAmount(movement.materialId, sql);
        }
      });
    }
  }

  async doAll() {
    await this.importInventory();
    await this.processAllJobs();
    await this.checkAll();
    await this.processAllImports();
  }

  async adjustInventory(file: File) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(file.buffer);

    const rows: any[] = wb
      .getWorksheet(1)
      .getRows(2, 10000)
      .map((row) => {
        let amount: any = row.getCell(7).result || row.getCell(7).value;
        if (isNaN(amount)) amount = 0;

        let rest: any = row.getCell(9).result || row.getCell(9).value;
        if (isNaN(rest)) rest = 0;

        return {
          code: row.getCell(1).value,
          amount: amount || 0,
          rest: rest || 0,
        };
      })
      .filter((item) => item.code);

    let job: any;
    let importRows: any;
    let restRows: any;

    await sql.begin(async (sql) => {
      // Suma las cantidades
      const [{ id: importId }] =
        await sql`insert into materialie (import, due) values (1, '2024-01-01') returning id`;
      const [{ id: jobId }] =
        await sql`Insert into materialie (jobpo, programation, due) values (1, 1, '2024-01-01' ) returning id`;

      for (const row of rows) {
        const { amount } = (
          await sql`select ("leftoverAmount" + amount) as amount from materials where code = ${row.code}`
        )[0];

        const difference = row.amount + row.rest - amount;

        if (difference > 0) {
          await sql`INSERT INTO materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
            ((select id from materials where code = ${row.code}), ${importId}, ${difference}, ${difference}, true, '2024-01-01')`;
        }
        if (difference < 0) {
          await sql`INSERT INTO materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
            ((select id from materials where code = ${row.code}), ${jobId}, ${difference}, ${difference}, true, '2024-01-01')`;
        }
      }

      // Anade los sobrantes
      const [{ id: restId }] =
        await sql`Insert into materialie (jobpo, programation, due) values (2, 1, '2024-01-01' ) returning id`;

      for (const row of rows) {
        const { leftoverAmount } = (
          await sql`select "leftoverAmount" from materials where code = ${row.code}`
        )[0];

        const difference = row.rest - leftoverAmount;

        if (difference > 0) {
          await sql`INSERT INTO materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
          ((select id from materials where code = ${row.code}), ${restId}, ${0}, ${-difference}, true, '2024-01-01')`;
        }
        if (difference < 0) {
          await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate", extra) values
          ((select id from materials where code = ${row.code}),
          (select id from materialie where import = 'Retorno'),
          ${Math.abs(difference)},
          ${Math.abs(difference)},
          true,
          '2024-01-01',
          true)`;
        }
      }

      job =
        await sql`select (select code from materials where id = "materialId") as code, amount from materialmovements where "movementId" = ${jobId}`;
      importRows =
        await sql`select (select code from materials where id = "materialId") as code, amount from materialmovements where "movementId" = ${importId}`;
      restRows =
        await sql`select (select code from materials where id = "materialId") as code, amount from materialmovements where "movementId" = ${importId}`;
    });

    await this.update();

    return [job, importRows, restRows];
  }

  async importEmployees(file: File) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(file.buffer);

    const areas = await sql`select id, name from areas`;
    const positions = await sql`select id, name from positions`;

    const rows: any[] = wb
      .getWorksheet(4)
      .getRows(2, 200)
      .map((row) => {
        return {
          noEmpleado: row.getCell(4).text.trim(),
          name: row.getCell(5).text.trim(),
          bornLocation: row.getCell(6).text.trim(),
          genre: row.getCell(7).text.trim()?.toUpperCase(),
          sons: parseInt(row.getCell(8).text.trim()) || 0,
          nss: row.getCell(9).text.trim(),
          clinicNo: row.getCell(10).text.trim(),
          curp: row.getCell(11).text.trim(),
          rfc: row.getCell(12).text.trim(),
          email: row.getCell(13).text.trim(),
          blood:
            row.getCell(14).text.trim()?.trim().toUpperCase() === 'N/A'
              ? null
              : row.getCell(14).text.trim(),
          number: row.getCell(15).text.trim(),
          direction: row.getCell(16).text.trim(),
          bornDate: row.getCell(17).value,
          bank: row.getCell(19).text.trim(),
          account: row.getCell(20).text.trim(),
          infonavitNo: row.getCell(21).text.trim(),
          infonavitFee: Number(row.getCell(22).text.trim()) || 0,
          infonavitDiscount: Number(row.getCell(23).text.trim()) || 0,
          emergencyContact: row.getCell(24).text.trim(),
          emergencyNumber: row.getCell(25).text.trim(),
          positionType: row.getCell(26).text.trim(),
          areaId: areas.find(
            (area) => area.name === row.getCell(27).text.trim(),
          )?.id,
          positionId: positions.find(
            (position) =>
              position.name ===
              row.getCell(28).text.trim() +
                (row.getCell(29).text.trim() === 'N/A' ||
                row.getCell(29).text.trim() === ''
                  ? ''
                  : ' ' + row.getCell(29).text.trim()),
          )?.id,
          admissionDate: row.getCell(30).value,
          bcpet: row.getCell(31).value,
          cim: row.getCell(34).value === 'N/A' ? null : row.getCell(34).value,
          shift: row.getCell(35).text.trim(),
          nominaSalary: Number(row.getCell(36).text.trim()) || 0,
        };
      })
      .filter((item) => item.noEmpleado);

    await sql`delete from employees`;

    for (const row of rows) {
      if (!row.areaId) throw new Error('Area not found ' + row.noEmpleado);
      if (!row.positionId)
        throw new Error('Position not found ' + row.noEmpleado);
      console.log(row.infonavitFee, row.infonavitDiscount, row.nominaSalary);
    }

    await sql`insert into employees ${sql(rows)}`;
  }

  async importEmployeePhotos(file: File) {
    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();
    let completed = 0;
    for (const entry of entries) {
      const image = await saveFile(
        {
          buffer: entry.getData(),
          originalname: entry.name,
        },
        'employees',
      );
      const [employee] =
        await sql`update employees set photo = ${image} where "noEmpleado" = ${entry.name.split('.')[0]} returning "noEmpleado"`;
      if (!employee) {
        await deleteFile(image);
        console.log('deleted ' + entry.name);
      } else {
        completed++;
      }
    }

    return { completed, total: entries.length };
  }

  async zenpet(file: File) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(file.buffer as any);

    const [{ id: prevId }] =
      await sql`select id from materialie where import = 'zenpet'`;
    await sql`delete from materialmovements where "movementId" = ${prevId}`;
    await sql`delete from materialie where id = ${prevId}`;
    await sql`delete from materials where "clientId" = 12`;

    const [{ id: importId }] =
      await sql`insert into materialie (import, due) values ('zenpet', '2024-01-01') returning id`;

    await sql.begin(async (sql) => {
      wb.getWorksheet(1)
        .getRows(2, 500)
        .forEach(async (row) => {
          if (String(row.getCell(2).value).trim().length < 5) return;

          const rowData = {
            code: String(row.getCell(2).value).trim(),
            description: String(row.getCell(3).value).trim(),
            clientId: 12,
            measurement: (row.getCell(6).value as string)?.trim() || 'EA-',
            location: (row.getCell(7).value as string)?.trim() || null,
            product: row.getCell(8).value?.toString().trim() === 'PRODUCTO',
            minAmount: Number(row.getCell(9).value) || 0,
          };

          const amount = Number(row.getCell(5).value);

          await sql`insert into materials ${sql(rowData)}`;
          await sql`insert into materialmovements ("materialId", "movementId", amount, "realAmount", active, "activeDate") values
            ((select id from materials where code = ${rowData.code}), ${importId}, ${amount}, ${amount}, true, '2024-01-01')`;
        });
    });

    return 'done';
  }
}
