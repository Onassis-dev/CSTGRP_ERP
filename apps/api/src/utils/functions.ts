import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import sql from './db';

export function getWeekDays(dateString: any) {
  if (dateString instanceof Date) {
    dateString = dateString.toISOString().split('T')[0];
  } else if (dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }

  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();

  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek - 1));

  const friday = new Date(date);
  friday.setDate(date.getDate() - (dayOfWeek - 5));

  return [
    monday.toISOString().split('T')[0],
    friday.toISOString().split('T')[0],
  ];
}

export function getDayNumber(date: any) {
  const dateObject = new Date(date);
  return dateObject.getDay() - 1;
}

export function separateAreas(rows: any) {
  let tableExists;
  const tables: Array<any> = [];

  rows.forEach((row: any) => {
    tableExists = false;
    tables.forEach((table, i) => {
      if (row.Area === table.Name) {
        tableExists = true;
        return tables[i].Rows.push(row);
      }
    });
    if (tableExists) return;
    tables.push({ Name: row.Area, Rows: [] });
    tables[tables.length - 1].Rows.push(row);
  });

  return tables;
}

export function formatDate(strDate?: string) {
  if (!strDate) return '';
  const partes = strDate.split('T');
  const fecha = partes[0].split('-');
  const fechaFormateada = fecha[2] + '/' + fecha[1] + '/' + fecha[0];
  return fechaFormateada;
}

export function getTijuanaDate() {
  const timeZone = 'America/Tijuana';
  const now = new Date();
  const zonedDate = toZonedTime(now, timeZone);
  return format(zonedDate, 'yyyy-MM-dd');
}

export async function updateMaterialAmount(id, dbInstance?: any) {
  if (!dbInstance) dbInstance = sql;

  await dbInstance`
    UPDATE materials

    SET amount = (
      SELECT COALESCE(SUM(materialmovements."realAmount"), 0)
      FROM materialmovements 
        JOIN materials ON materials.id = materialmovements."materialId"
      WHERE materialmovements.active = true
        AND materials.id = ${id}
    ),

    "leftoverAmount" = ( 
        SELECT COALESCE(SUM(materialmovements."realAmount" - materialmovements.amount), 0)
        FROM materialmovements 
          JOIN materials ON materials.id = materialmovements."materialId"
        WHERE materialmovements.active = true
          AND materials.id = ${id}
      ) * -1,

    "pendingAmount" = (
    SELECT COALESCE(SUM(amount), 0)
      FROM materialmovements 
      WHERE "importId" IS NOT NULL
      AND active = false
      AND "materialId" = ${id}
    )

    WHERE id = ${id} 
    returning amount`;
}

export async function otorgateVacations() {
  const today = getTijuanaDate();

  // What after 35 years????
  try {
    await sql`
    WITH
    employees_to_otorgate AS (
      SELECT 
      employees.id,
      employees."admissionDate",
      COALESCE((select max(year) from "vacationsGranted" where "employeeId" = employees.id), 0) as last_granted,
      (SELECT EXTRACT(YEAR FROM AGE(${today}, employees."admissionDate"))::int)as seniority
      FROM employees
      WHERE active = true
    )
    INSERT INTO "vacationsGranted" ("employeeId", year, date, days)
    SELECT 
    id, 
    last_granted + 1,
    "admissionDate" + (interval '1 year' * (last_granted + 1)),
    CASE
        WHEN last_granted + 1 = 1 THEN 12
        WHEN last_granted + 1 = 2 THEN 14
        WHEN last_granted + 1 = 3 THEN 16
        WHEN last_granted + 1 = 4 THEN 18
        WHEN last_granted + 1 = 5 THEN 20
        WHEN last_granted + 1 >= 6 AND last_granted + 1 <= 10 THEN 22
        WHEN last_granted + 1 >= 11 AND last_granted + 1 <= 15 THEN 24
        WHEN last_granted + 1 >= 16 AND last_granted + 1 <= 20 THEN 26
        WHEN last_granted + 1 >= 21 AND last_granted + 1 <= 25 THEN 28
        WHEN last_granted + 1 >= 26 AND last_granted + 1 <= 30 THEN 30
        WHEN last_granted + 1 >= 31 AND last_granted + 1 <= 35 THEN 32
        ELSE 0 
        END
        FROM employees_to_otorgate
        WHERE seniority > last_granted
        ON CONFLICT ("employeeId", year) DO NOTHING
        `;

    await calculateVacationDays();
    console.log('VACATIONS_OTORGATED');
  } catch (error) {
    console.error('VACATIONS_ERROR:', error);
  }
}

export async function calculateVacationDays(id?: number, dbInstance?: any) {
  if (!dbInstance) dbInstance = sql;

  await dbInstance`
    UPDATE employees SET vacations = 
    (
      SELECT COALESCE(SUM("vacationsGranted".days), 0)
      FROM "vacationsGranted"
      WHERE "employeeId" = employees.id
    )
      -
    (
      SELECT COALESCE(SUM("vacations".days), 0)
      FROM "vacations"
      WHERE "employeeId" = employees.id
    )
    WHERE employees.active = true
    ${id ? sql`AND employees.id = ${id}` : sql``}
  `;
}

export const weeklyMinutes = sql`
      SUM(
        CASE WHEN (s."areaId" = a.id)
          THEN COALESCE(s.hours0,0) - COALESCE(s.supportmin0,0) ELSE 0 END
      ) +
      SUM(
        CASE WHEN (s."areaId0" = a.id)
          THEN COALESCE(s.supportmin0,0) ELSE 0 END
      )  AS "mondayMinutes",

      SUM(
        CASE WHEN (s."areaId" = a.id)
          THEN COALESCE(s.hours1,0) - COALESCE(s.supportmin1,0) ELSE 0 END
      ) +
      SUM(
        CASE WHEN (s."areaId1" = a.id)
          THEN COALESCE(s.supportmin1,0) ELSE 0 END
      ) AS "tuesdayMinutes",

      SUM(
        CASE WHEN (s."areaId" = a.id)
          THEN COALESCE(s.hours2,0) - COALESCE(s.supportmin2,0) ELSE 0 END
      ) +
      SUM(
        CASE WHEN (s."areaId2" = a.id)
          THEN COALESCE(s.supportmin2,0) ELSE 0 END
      ) AS "wednesdayMinutes",

      SUM(
        CASE WHEN (s."areaId" = a.id)
          THEN COALESCE(s.hours3,0) - COALESCE(s.supportmin3,0) ELSE 0 END
      ) +
      SUM(
        CASE WHEN (s."areaId3" = a.id)
          THEN COALESCE(s.supportmin3,0) ELSE 0 END
      ) AS "thursdayMinutes",

      SUM(
        CASE WHEN (s."areaId" = a.id)
          THEN COALESCE(s.hours4,0) - COALESCE(s.supportmin4,0) ELSE 0 END
      ) +
      SUM(
        CASE WHEN (s."areaId4" = a.id)
          THEN COALESCE(s.supportmin4,0) ELSE 0 END
      ) AS "fridayMinutes"`;
