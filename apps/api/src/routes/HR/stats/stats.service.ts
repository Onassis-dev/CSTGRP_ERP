import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';
import { getDayNumber, getWeekDays } from 'src/utils/functions';
import { areaAssistanceInfoSchema, dateSchema } from './stats.schema';
import { z } from 'zod';

@Injectable()
export class StatsService {
  async birthDays(body: z.infer<typeof dateSchema>) {
    const rows =
      await sql`SELECT "noEmpleado", photo, CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name, "bornDate" from employees where extract(month from "bornDate") = extract(month from ${body.date}::DATE)`;

    return rows;
  }

  async contractExpiration() {
    const today = new Date();

    const fiveDaysAhead = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5,
    );

    // Calculate renewal dates based on admission date and contract number
    const rows = await sql`
      SELECT 
        "noEmpleado", 
        photo, 
        CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name, 
        "admissionDate", 
        contract,
        CASE 
          WHEN contract = 0 THEN "admissionDate" -- Initial contract
          WHEN contract = 1 THEN "admissionDate" + INTERVAL '1 month' -- First renewal
          WHEN contract = 2 THEN "admissionDate" + INTERVAL '2 months' -- Second renewal
          WHEN contract = 3 THEN "admissionDate" + INTERVAL '3 months' -- Third renewal (before indefinite)
        END as next_renewal_date

      FROM employees
      WHERE 
        -- Only include employees with contracts 0-3 (pre-indefinite contract)
        contract < 4
        -- Alert when renewal date is today, in the past (overdue), or within next 5 days
        AND (
          CASE 
            WHEN contract = 0 THEN "admissionDate"
            WHEN contract = 1 THEN "admissionDate" + INTERVAL '1 month'
            WHEN contract = 2 THEN "admissionDate" + INTERVAL '2 months'
            WHEN contract = 3 THEN "admissionDate" + INTERVAL '3 months'
          END
        ) <= ${fiveDaysAhead}
      ORDER BY next_renewal_date
    `;

    console.log(rows);

    return rows;
  }

  async weeklyFires(body: z.infer<typeof dateSchema>) {
    const [firstDate] = getWeekDays(body.date);
    const rows =
      await sql`SELECT COUNT(*) as count FROM assistance where Date = ${firstDate} and 6 IN (incidenceId0, incidenceId1, incidenceId2, incidenceId3, incidenceId4)`;

    return rows;
  }

  async weeklyHires(body: z.infer<typeof dateSchema>) {
    const [firstDate, secondDate] = getWeekDays(body.date);
    const rows =
      await sql`SELECT COUNT(*) as count FROM employees where admissionDate >= ${firstDate} and admissionDate <= ${secondDate}`;

    return rows;
  }

  async assistance(body: z.infer<typeof dateSchema>) {
    const [firstDate] = getWeekDays(body.date);
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const evaluatedWeek = new Date(
        new Date(firstDate).setDate(new Date(firstDate).getDate() - i * 7),
      )
        .toISOString()
        .split('T')[0];

      const activeEmployees = (
        await sql`select count(*) from assistance where "mondayDate"  = ${evaluatedWeek}`
      )[0].count;
      const week = await sql`SELECT 
      (
        SUM(CASE WHEN "incidenceId0" = 1 THEN 1 ELSE 0 END) +
        SUM(CASE WHEN "incidenceId1" = 1 THEN 1 ELSE 0 END) +
        SUM(CASE WHEN "incidenceId2" = 1 THEN 1 ELSE 0 END) +
        SUM(CASE WHEN "incidenceId3" = 1 THEN 1 ELSE 0 END) +
        SUM(CASE WHEN "incidenceId4" = 1 THEN 1 ELSE 0 END)
        ) / (COUNT(*) * 5.0) AS value, 
        ${evaluatedWeek + ' / ' + activeEmployees + ' Empleados'} AS name
        FROM 
        "assistance"
        WHERE 
        "mondayDate" = ${evaluatedWeek}`;
      rows.push(week[0]);
    }

    return rows
      .reverse()
      .map((e) => ({ ...e, value: Math.floor(e.value * 100) }));
  }

  async assistanceInfo(body: z.infer<typeof dateSchema>) {
    const [firstDate] = getWeekDays(body.date);
    let dayNumber = getDayNumber(body.date);
    if (dayNumber === 5 || dayNumber === -1) dayNumber = 4;

    const rows =
      await sql`SELECT (select name from incidences where id = ${sql('incidenceId' + dayNumber)}) as name, COUNT(*) as value FROM assistance WHERE "mondayDate" = ${firstDate} GROUP BY ${sql('incidenceId' + dayNumber)}`;

    return rows;
  }

  async dailyAssistance(body: z.infer<typeof dateSchema>) {
    const [firstDate] = getWeekDays(body.date);
    let dayNumber = getDayNumber(body.date);
    if (dayNumber === 5 || dayNumber === -1) dayNumber = 4;

    const total = await sql`
      SELECT COUNT(*) as count 
      FROM assistance 
      WHERE "mondayDate" = ${firstDate}
    `;

    const present = await sql`
      SELECT COUNT(*) as count 
      FROM assistance 
      WHERE "mondayDate" = ${firstDate} 
      AND ${sql('incidenceId' + dayNumber)} = 1
    `;

    return (
      (Number(present[0].count) / Number(total[0].count)) * 100 || 0
    ).toFixed(2);
  }

  async dailyIncidencesList(body: z.infer<typeof dateSchema>) {
    const [firstDate] = getWeekDays(body.date);
    let dayNumber = getDayNumber(body.date);
    if (dayNumber === 5 || dayNumber === -1) dayNumber = 4;

    const rows =
      await sql`SELECT (select name from incidences where id = ${sql('incidenceId' + dayNumber)}) as incidence, (select photo from employees where id = "employeeId"), 
        (select CONCAT(name, ' ', "paternalLastName", ' ', "maternalLastName") as name from employees where id = "employeeId"),
        (select "areaId" from employees where id = "employeeId")
      FROM assistance WHERE "mondayDate" = ${firstDate}
       AND ${sql('incidenceId' + dayNumber)} <> 1
      GROUP BY ${sql('incidenceId' + dayNumber)}, "employeeId"`;

    return rows;
  }

  async areaAssistanceInfo(query: z.infer<typeof areaAssistanceInfoSchema>) {
    const [firstDate] = getWeekDays(query.date);
    let dayNumber = getDayNumber(query.date);
    if (dayNumber === 5 || dayNumber === -1) dayNumber = 4;

    const rows =
      await sql`SELECT (select name from incidences where id = ${sql('incidenceId' + dayNumber)}) as name, COUNT(*) as value FROM assistance WHERE "mondayDate" = ${firstDate} and "employeeId" in (select id from employees where "areaId" = ${query.areaId}) GROUP BY ${sql('incidenceId' + dayNumber)}`;

    return rows;
  }

  async activeEmployees() {
    const rows = await sql`SELECT count(*) from employees where active`;
    return rows;
  }

  async employeeTemplate() {
    const rows = await sql`SELECT value from general where Name = 'Plantilla'`;
    return rows;
  }

  async employeeRotation(body: z.infer<typeof dateSchema>) {
    const [firstDate, secondDate] = getWeekDays(body.date);
    const dayMiliSeconds = 24 * 60 * 60 * 1000;

    const initialDate = new Date(
      new Date(firstDate).getTime() - 365 * dayMiliSeconds,
    )
      .toISOString()
      .split('T')[0];

    const finalDate = new Date(new Date(secondDate).getTime())
      .toISOString()
      .split('T')[0];

    let [{ fires }] = await sql`
      Select COUNT(*) as fires from employees where "quitDate" >= ${initialDate} and "quitDate" <= ${finalDate}`;
    fires = Number(fires);
    let [{ hires }] = await sql`
      Select COUNT(*) as hires from employees where "admissionDate" >= ${initialDate} and "admissionDate" <= ${finalDate}`;
    hires = Number(hires);
    let [{ finalEmployees }] = await sql`
    SELECT COUNT(*) as "finalEmployees" FROM employees where active`;
    finalEmployees = Number(finalEmployees);

    const initalEmployees = finalEmployees + fires - hires;

    const result = (
      ((fires + hires) / 2 / ((initalEmployees + finalEmployees) / 2)) *
      100
    ).toFixed(2);

    return result;
  }
}
