import { Injectable } from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';
import {
  createSchema,
  editSchema,
  getEmployeeSchema,
  getEmployeesSchema,
  quitSchema,
  reactivateSchema,
  templateSchema,
  updateSalarySchema,
} from './employees.schema';
import { z } from 'zod/v4';
import sql from 'src/utils/db';
import { getWeekDays } from 'src/utils/functions';
import exceljs from 'exceljs';
import { saveFile } from 'src/utils/storage';
import { createRecord } from './employees.utils';
import { ContextProvider } from 'src/interceptors/context.provider';
import { convertTableToExcel } from 'src/utils/exports';

@Injectable()
export class EmployeesService {
  constructor(private readonly req: ContextProvider) {}

  async getAssistance(body) {
    const [firstDate] = getWeekDays(new Date());

    const dates = [];
    for (let i = 0; i < 32; i++) {
      dates.push(
        new Date(
          new Date(firstDate).setDate(new Date(firstDate).getDate() - 7 * i),
        ).toISOString(),
      );
    }

    const rows = await sql`SELECT "mondayDate",
    (SELECT name FROM incidences WHERE id = assistance."incidenceId0") AS "incidence0",
    (SELECT name FROM incidences WHERE id = assistance."incidenceId1") AS "incidence1",
    (SELECT name FROM incidences WHERE id = assistance."incidenceId2") AS "incidence2",
    (SELECT name FROM incidences WHERE id = assistance."incidenceId3") AS "incidence3",
    (SELECT name FROM incidences WHERE id = assistance."incidenceId4") AS "incidence4"
    FROM assistance
    WHERE "mondayDate" in ${sql(dates)} AND "employeeId" = ${parseInt(body.id)}
    ORDER BY "mondayDate" desc`;

    const result = dates.map((date) => {
      const row = rows.find((e: any) => e.mondayDate.toISOString() === date);

      return (
        row || {
          mondayDate: date,
          incidence0: null,
          incidence1: null,
          incidence2: null,
          incidence3: null,
          incidence4: null,
        }
      );
    });

    return result;
  }

  async getProductivity(body) {
    const [firstDate] = getWeekDays(new Date());

    const dates = [];
    for (let i = 0; i < 8; i++) {
      dates.push(
        new Date(
          new Date(firstDate).setDate(new Date(firstDate).getDate() - 7 * i),
        ).toISOString(),
      );
    }

    const rows = await sql`select *
    from employeeproductivity
    JOIN assistance
    On assistance.id = employeeproductivity."assistanceId"
    where assistance."mondayDate" in ${sql(dates)} 
    And assistance."employeeId" = ${parseInt(body.id)}
    order by "mondayDate" desc`;

    const result = dates.map((date) => {
      const row = rows.find((e: any) => e.mondayDate.toISOString() === date);

      return (
        row || {
          mondayDate: date,
        }
      );
    });

    return result;
  }

  async getEmployees(query: z.infer<typeof getEmployeesSchema>) {
    const employees =
      await sql`select id, name, "admissionDate", "paternalLastName", "maternalLastName", "noEmpleado", "areaId", "positionId", active from employees where active = ${query.active} order by "noEmpleado" DESC`;

    return employees;
  }

  async getEmployee(body: z.infer<typeof getEmployeeSchema>) {
    return await sql`select * from employees where id = ${body.id}`;
  }

  async registerEmployee(body: z.infer<typeof createSchema>, file: File) {
    const image = await saveFile(file, 'employees');
    const formatDate = body.formatDate;
    delete body.formatDate;

    const id: any = await sql.begin(async (sql) => {
      const [employee]: any =
        await sql`insert into employees ${sql({ ...body, photo: image })}
        returning *, (select name from positions where id = "positionId") as position, (select name from areas where id = "areaId") as area`;

      //Create record
      await this.req.record(
        `Registró al empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado}`,
        sql,
      );
      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${employee.id}, now(), 'alta', 'Empleado dado de alta', ${JSON.stringify({ ...employee, type: 'alta', formatDate })})`;

      //Generate assistance for the week
      const [firstDate] = getWeekDays(employee.admissionDate);
      const [{ count }] =
        await sql`select count(*) from assistance where "mondayDate" = ${firstDate}`;

      if (count === '0') return employee.id;
      const [assistanceRow] =
        await sql`insert into assistance ("mondayDate", "positionId", "areaId", "employeeId") values
    (${firstDate}, ${employee.positionId}, ${employee.areaId}, ${employee.id}) returning id`;

      //Generate productivity for the week
      const [{ captured }] =
        await sql`select captured from areas where "id" = ${employee.areaId}`;
      if (!captured) return employee.id;

      await sql`insert into employeeproductivity ("assistanceId") values
    (${assistanceRow.id})`;
      return employee.id;
    });

    return id;
  }

  async editEmployee(body: z.infer<typeof editSchema>, file: File) {
    const [previousObj] =
      await sql`select * from employees where id = ${body.id}`;

    const image = await saveFile(file, 'employees', previousObj.photo);

    await sql.begin(async (sql) => {
      const [newEmployee] =
        await sql`update "employees" SET ${sql({ ...body, photo: image })} where id = ${body.id} returning *`;

      //Create record
      await this.req.record(
        `Editó al empleado ${newEmployee.name} ${newEmployee.paternalLastName} ${newEmployee.maternalLastName} - ${newEmployee.noEmpleado}`,
        sql,
      );
      await createRecord({ previous: previousObj, current: newEmployee }, sql);
    });

    return;
  }

  async reactivateEmployee(body: z.infer<typeof reactivateSchema>) {
    const formatDate = body.formatDate;
    delete body.formatDate;
    const data = {
      ...body,
      active: true,
      quitDate: null,
      quitStatus: null,
      quitNotes: null,
      quitReason: null,
    };

    await sql.begin(async (sql) => {
      const [employee] =
        await sql`update "employees" SET ${sql(data)} where id = ${data.id} 
        returning *, (select name from areas where id = "areaId") as "area", (select name from positions where id = "positionId") as "position"`;

      //Create record
      await this.req.record(
        `Reactivó al empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado}`,
        sql,
      );
      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${employee.id}, now(), 'alta', ${'Empleado reactivado en el area ' + employee.area + ', en el puesto ' + employee.position}, ${JSON.stringify({ ...employee, type: 'alta', formatDate })})`;

      //Generate assistance for the week
      const [firstDate] = getWeekDays(employee.admissionDate);
      const [{ count }] =
        await sql`select count(*) from assistance where "mondayDate" = ${firstDate}`;

      if (count === '0') return;
      const [assistanceRow] =
        await sql`insert into assistance ("mondayDate", "positionId", "areaId", "employeeId") values
    (${firstDate}, ${employee.positionId}, ${employee.areaId}, ${employee.id}) returning id`;

      //Generate productivity for the week
      const [{ captured }] =
        await sql`select captured from areas where "id" = ${employee.areaId}`;
      if (!captured) return;

      await sql`insert into employeeproductivity ("assistanceId") values
    (${assistanceRow.id})`;
    });

    return;
  }

  async quitEmployee(body: z.infer<typeof quitSchema>) {
    await sql.begin(async (sql) => {
      const [employee] =
        await sql`update employees set active = false, "quitDate" = ${body.quitDate}, "quitStatus" = ${body.quitStatus}, "quitReason" = ${body.quitReason}, "quitNotes" = ${body.quitNotes}, "resignationDate" = ${body.resignationDate}, "lastDay" = ${body.lastDay}  where id = ${body.id}
        returning *, (select name from positions where id = "positionId") as position, (select name from areas where id = "areaId") as area`;

      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${body.id}, now(), 'baja', 'Empleado dado de baja', ${JSON.stringify({ ...employee, type: 'baja', formatDate: body.formatDate })})`;
      await this.req.record(
        `Dio de baja al empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado}`,
        sql,
      );
    });
    return;
  }

  async updateSalary(body: z.infer<typeof updateSalarySchema>) {
    const formatDate = body.formatDate;
    delete body.formatDate;

    await sql.begin(async (sql) => {
      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName", "noEmpleado", "nominaSalary" as "oldSalary", "admissionDate" from employees where id = ${body.id}`;
      await sql`update employees set "nominaSalary" = ${body.newSalary} where id = ${body.id}`;

      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${body.id}, now(), 'cambio', ${'Salario modificado a ' + body.newSalary},
       ${JSON.stringify({ ...employee, ...body, type: 'salario', formatDate })}
       )`;

      await this.req.record(
        `Modificó el salario del empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado} a ${body.newSalary}`,
        sql,
      );
    });
  }

  async updateTemplate(body: z.infer<typeof templateSchema>) {
    await sql.begin(async (sql) => {
      await sql`update general set value = ${body.template} where name = 'Plantilla'`;
      await this.req.record(
        `Actualizó la plantilla de empleados a ${body.template}`,
        sql,
      );
    });
  }

  async export() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Empleados');

    const rows =
      await sql`select employees.*, employees.active::integer as active, positions.name as position, areas.name as area from employees
    join areas on areas.id = employees."areaId"
    join positions on positions.id = employees."positionId"
    order by employees.active DESC, "noEmpleado" DESC`;

    worksheet.columns = convertTableToExcel({
      rows,
      width: 25,
      customRows: [
        { width: 8, key: 'active', header: 'Activo' },
        { width: 20, key: 'noEmpleado', header: 'No. Empleado' },
        { width: 20, key: 'name', header: 'Nombre' },
        { width: 20, key: 'paternalLastName', header: 'Apellido Paterno' },
        { width: 20, key: 'maternalLastName', header: 'Apellido Materno' },
        { width: 20, key: 'position', header: 'Puesto' },
        { width: 20, key: 'area', header: 'Área' },
      ],
    });

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    return await workbook.xlsx.writeBuffer();
  }

  async exportBasic() {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Empleados');

    const rows =
      await sql`select "noEmpleado", CONCAT(employees.name, ' ', "paternalLastName", ' ', "maternalLastName") as "name", positions.name as position, areas.name as area from employees
    join areas on areas.id = employees."areaId"
    join positions on positions.id = employees."positionId"
    where employees.active
    order by "noEmpleado" DESC`;

    worksheet.columns = convertTableToExcel({
      rows,
      width: 30,
      customRows: [
        { width: 10, key: 'noEmpleado', header: 'No. Empleado' },
        { width: 40, key: 'name', header: 'Nombre' },
        { width: 30, key: 'position', header: 'Puesto' },
        { width: 30, key: 'area', header: 'Área' },
      ],
    });

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    return workbook.xlsx.writeBuffer();
  }
}
