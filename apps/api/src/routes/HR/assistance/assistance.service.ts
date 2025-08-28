import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { formatDate, getWeekDays } from 'src/utils/functions';
import { editSchema, getSingleSchema, weekSchema } from './assistance.schema';
import { ContextProvider } from 'src/interceptors/context.provider';
@Injectable()
export class AssistanceService {
  constructor(private readonly req: ContextProvider) {}

  async getWeek(body: z.infer<typeof weekSchema>) {
    const [firstDate] = getWeekDays(body.date);

    const assistance =
      await sql`SELECT id, "incidenceId0", "incidenceId1", "incidenceId2", "incidenceId3", "incidenceId4", "areaId", "positionId",
      "areaId0", "areaId1", "areaId2", "areaId3", "areaId4", "hours0", "hours1", "hours2", "hours3", "hours4",
      (select CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") from employees where id = "employeeId") as name,
      (select "noEmpleado" from employees where id = "employeeId")

      from assistance WHERE "mondayDate" = ${firstDate}
    ORDER BY "areaId", "positionId", "name";`;

    return assistance;
  }

  async getSingle(body: z.infer<typeof getSingleSchema>) {
    return body;
  }

  async createWeek(body: z.infer<typeof weekSchema>) {
    const [user] =
      await sql`select permissions from users where id = ${this.req.userId}`;
    if (user.permissions.assistance < 3)
      throw new HttpException('No tienes permisos para generar semanas', 400);

    const [firstDate] = getWeekDays(body.date);
    const [actualDate] = getWeekDays(new Date());

    if (new Date(firstDate) > new Date(actualDate))
      throw new HttpException('No se puede generar una semana futura', 400);

    const [alreadyExists] =
      await sql`select 1 from assistance where "mondayDate" = ${firstDate}`;
    if (alreadyExists) throw new HttpException('Ya se genero esa semana', 400);

    await sql.begin(async (sql) => {
      await sql`INSERT INTO assistance ("employeeId", "areaId", "positionId", "mondayDate")
    SELECT id, "areaId", "positionId", ${firstDate} FROM employees where active`;

      await sql`INSERT INTO employeeproductivity ("assistanceId")
    select id from assistance where "mondayDate" = ${firstDate} and (select captured from areas where id = assistance."areaId") = true`;

      await this.req.record(
        `Generó una semana de asistencia para el ${firstDate}`,
        sql,
      );
    });
  }

  async editSingle(body: z.infer<typeof editSchema>) {
    await sql.begin(async (sql) => {
      const [week] =
        await sql`update assistance set ${sql(body)} where id = ${body.id} returning "mondayDate"`;

      await this.req.record(
        `Editó una semana de asistencia para el ${week.mondayDate}`,
        sql,
      );
    });
  }

  async export(body: z.infer<typeof weekSchema>) {
    interface assistance {
      position: string;
      area: string;
      name: string;
      lunes: string;
      martes: string;
      miercoles: string;
      jueves: string;
      viernes: string;
      noEmpleado: string;
    }

    const [firstDate, lastDate] = getWeekDays(body.date);

    const weekDays = [];
    const areas: any = {};

    const mondayDate = new Date(firstDate);
    for (let i = 0; i < 5; i++) {
      mondayDate.setDate(mondayDate.getDate() + (i > 0 ? 1 : 0));
      weekDays.push(formatDate(mondayDate.toISOString().split('T')[0]));
    }

    const assistance: assistance[] = await sql`SELECT id, 
        (SELECT code FROM incidences WHERE id = "incidenceId0") AS lunes,
        (SELECT code FROM incidences WHERE id = "incidenceId1") AS martes,
        (SELECT code FROM incidences WHERE id = "incidenceId2") AS miercoles,
        (SELECT code FROM incidences WHERE id = "incidenceId3") AS jueves,
        (SELECT code FROM incidences WHERE id = "incidenceId4") AS viernes,
        (SELECT name FROM areas WHERE id = "areaId") AS area,
        (SELECT name FROM positions WHERE id = "positionId") AS position,
        (SELECT CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") FROM employees WHERE id = "employeeId") AS name,
        (SELECT "noEmpleado" FROM employees WHERE id = "employeeId") AS "noEmpleado"
      FROM assistance 
      WHERE "mondayDate" = ${firstDate}
      ORDER BY "areaId", "positionId", "name";
`;

    assistance.forEach((e: any) => {
      if (!areas[e.area]) areas[e.area] = [];
      areas[e.area].push(e);
    });

    const generateRows = (area: assistance[]) => {
      const objNormalized = area.map((row: assistance) => {
        return {
          ...row,
          position:
            (row.position?.includes('Costurero')
              ? 'Costurero'
              : row.position) || '',
        };
      });
      const rowsArray = [];

      rowsArray.push([
        {
          content: objNormalized[0].position,
          colSpan: 8,
          styles: {
            fillColor: [81, 120, 113],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
        },
      ]);

      for (const [i, row] of area.entries()) {
        rowsArray.push([
          row.noEmpleado,
          row.name,
          row.position,
          row.lunes,
          row.martes,
          row.miercoles,
          row.jueves,
          row.viernes,
        ]);

        if (i + 1 === objNormalized.length) continue;
        if (
          area[0].area !== 'Staff' &&
          area[0].area !== 'Varios' &&
          objNormalized[i].position !== objNormalized[i + 1].position
        ) {
          rowsArray.push([
            {
              content: objNormalized[i + 1].position,
              colSpan: 8,
              styles: {
                fillColor: [81, 120, 113],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
            },
          ]);
        }
      }
      return rowsArray;
    };

    const pdf = new jsPDF({
      unit: 'mm',
      format: [215.9, 279.4],
    });

    Object.keys(areas).forEach((area: string, index: number) => {
      if (index > 0) {
        pdf.addPage();
      }

      autoTable(pdf, {
        theme: 'plain',
        columnStyles: {
          0: { fontStyle: 'bold', fontSize: 16 },
          1: { fontStyle: 'bold', fontSize: 12, halign: 'right' },
        },
        body: [
          [area, `Del ${formatDate(firstDate)} al ${formatDate(lastDate)}`],
        ],
      });

      autoTable(pdf, {
        styles: {
          lineColor: [45, 45, 45],
          cellPadding: 2,
        },
        headStyles: {
          textColor: [255, 255, 255],
          fillColor: [45, 45, 45],
          lineColor: [45, 45, 45],
        },
        theme: 'grid',
        head: [['No. Empleado', 'Nombre', 'Puesto', ...weekDays]],
        body: generateRows(areas[area]),
      });
    });

    const buffer = Buffer.from(pdf.output('arraybuffer'));

    return buffer;
  }
}
