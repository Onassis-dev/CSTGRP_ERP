import { Injectable } from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';
import {
  createSchema,
  editSchema,
  idSchema,
  quitSchema,
  reactivateSchema,
  templateSchema,
  updateSalarySchema,
} from './employees.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import { getWeekDays } from 'src/utils/functions';
import exceljs from 'exceljs';
import { saveFile } from 'src/utils/storage';
import { createRecord } from './employees.utils';
import { ContextProvider } from 'src/interceptors/context.provider';

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

  async getActiveEmployees() {
    const employees =
      await sql`select id, name, "admissionDate", "paternalLastName", "maternalLastName", "noEmpleado", "areaId", "positionId", active from employees where active order by "noEmpleado" DESC`;
    return employees;
  }

  async getEmployee(body: z.infer<typeof idSchema>) {
    return await sql`select * from employees where id = ${body.id}`;
  }

  async getInactiveEmployees() {
    const employees =
      await sql`select * from employees where active = false order by "noEmpleado" DESC`;
    return employees;
  }

  async registerEmployee(body: z.infer<typeof createSchema>, file: File) {
    const image = await saveFile(file, 'employees');

    const id: any = await sql.begin(async (sql) => {
      const [employee]: any =
        await sql`insert into employees ${sql({ ...body, photo: image })}
        returning *, (select name from positions where id = "positionId") as position, (select name from areas where id = "areaId") as area`;

      //Create record
      await this.req.record(
        `Registró al empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado}`,
        sql,
      );
      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${employee.id}, now(), 'alta', 'Empleado dado de alta', ${JSON.stringify({ ...employee, type: 'alta' })})`;

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
      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${employee.id}, now(), 'alta', ${'Empleado reactivado en el area ' + employee.area + ', en el puesto ' + employee.position}, ${JSON.stringify({ ...employee, type: 'alta' })})`;

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

      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${body.id}, now(), 'baja', 'Empleado dado de baja', ${JSON.stringify({ ...employee, type: 'baja' })})`;
      await this.req.record(
        `Dio de baja al empleado ${employee.name} ${employee.paternalLastName} ${employee.maternalLastName} - ${employee.noEmpleado}`,
        sql,
      );
    });
    return;
  }

  async updateSalary(body: z.infer<typeof updateSalarySchema>) {
    await sql.begin(async (sql) => {
      const [employee] =
        await sql`select name, "paternalLastName", "maternalLastName", "noEmpleado", "nominaSalary" as "oldSalary", "admissionDate" from employees where id = ${body.id}`;
      await sql`update employees set "nominaSalary" = ${body.newSalary} where id = ${body.id}`;

      await sql`insert into employeeRecords ("employeeId", date, type, text, doc) values (${body.id}, now(), 'cambio', ${'Salario modificado a ' + body.newSalary},
       ${JSON.stringify({ ...employee, ...body, type: 'salario' })}
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
    const worksheet = workbook.addWorksheet('Inventario');

    const rows =
      await sql`select *, positions.name as position, areas.name as area from employees
    join areas on areas.id = employees."areaId"
    join positions on positions.id = employees."positionId"
    where active`;

    worksheet.columns = [
      { header: 'No. Empleado', key: 'noEmpleado', width: 25 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Apellido paterno', key: 'paternalLastName', width: 25 },
      { header: 'Apellido materno', key: 'maternalLastName', width: 25 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'position', width: 25 },
      { header: 'Salario de Nómina', key: 'nominaSalary', width: 25 },
      { header: 'Salario IMMS', key: 'immsSalary', width: 25 },
      { header: 'Fecha de Baja', key: 'quitDate', width: 25 },
      { header: 'Fecha de Admisión', key: 'admissionDate', width: 25 },
      { header: 'Fecha de Nacimiento', key: 'bornDate', width: 25 },
      { header: 'Cuota Infonavit', key: 'infonavitFee', width: 25 },
      { header: 'Descuento Infonavit', key: 'infonavitDiscount', width: 25 },
      { header: 'Hijos', key: 'sons', width: 25 },
      { header: 'Banco', key: 'bank', width: 25 },
      { header: 'No. Infonavit', key: 'infonavitNo', width: 25 },
      { header: 'Tipo de Puesto', key: 'positionType', width: 25 },
      { header: 'Turno', key: 'shift', width: 25 },
      { header: 'Apellido Paterno', key: 'paternalLastName', width: 25 },
      { header: 'Apellido Materno', key: 'maternalLastName', width: 25 },
      { header: 'Nacionalidad', key: 'nationality', width: 25 },
      { header: 'Estudios', key: 'studies', width: 25 },
      { header: 'NSS', key: 'nss', width: 25 },
      { header: 'CURP', key: 'curp', width: 25 },
      { header: 'RFC', key: 'rfc', width: 25 },
      { header: 'Tipo de Sangre', key: 'blood', width: 25 },
      { header: 'Cuenta Bancaria', key: 'account', width: 25 },
      { header: 'Contacto de Emergencia', key: 'emergencyContact', width: 25 },
      { header: 'Número de Emergencia', key: 'emergencyNumber', width: 25 },
      { header: 'Lugar de Nacimiento', key: 'bornLocation', width: 25 },
      { header: 'Género', key: 'genre', width: 25 },
      { header: 'No. de Clínica', key: 'clinicNo', width: 25 },
      { header: 'Correo Electrónico', key: 'email', width: 25 },
      { header: 'Número de Teléfono', key: 'number', width: 25 },
      { header: 'Dirección', key: 'direction', width: 25 },
    ];

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
      await sql`select CONCAT(employees.name, ' ', "paternalLastName", ' ', "maternalLastName") as "name", "noEmpleado", positions.name as position, areas.name as area from employees
    join areas on areas.id = employees."areaId"
    join positions on positions.id = employees."positionId"
    where active`;

    worksheet.columns = [
      { header: 'No. Empleado', key: 'noEmpleado', width: 25 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'position', width: 25 },
    ];

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = { font: { bold: true } };
    });

    return workbook.xlsx.writeBuffer();
  }
}
