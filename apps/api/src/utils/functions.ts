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
      SELECT COALESCE(SUM(materialmovements."realAmount"), 0) AS balance
      FROM materialmovements 
        JOIN materials ON materials.id = materialmovements."materialId"
        JOIN materialie ON materialie.id = materialmovements."movementId"
      WHERE materialmovements.active = true
        AND (materialie.location IS NULL OR materialie.location = 'At CST, Qtys verified' or materialie.import = 'Retorno')
        AND materials.id = ${id}
    ),

    "leftoverAmount" = (
      ( 
        SELECT COALESCE(SUM(materialmovements."realAmount" - materialmovements.amount), 0) AS balance
        FROM materialmovements 
          JOIN materials ON materials.id = materialmovements."materialId"
          JOIN materialie ON materialie.id = materialmovements."movementId"
        WHERE materialmovements.active = true
          AND (materialie.location IS NULL OR materialie.location = 'At CST, Qtys verified')
          AND materialmovements.extra = false
          AND materials.id = ${id}
      ) 
        +
      ( 
        SELECT COALESCE(SUM(materialmovements.amount), 0) AS balance
        FROM materialmovements 
          JOIN materials ON materials.id = materialmovements."materialId"
          JOIN materialie ON materialie.id = materialmovements."movementId"
        WHERE materialmovements.active = true
          AND materialmovements.extra = true
          AND materialie.id = (select id from materialie where import = 'Retorno')
          AND materials.id = ${id}
      )
        -
      ( 
        SELECT COALESCE(SUM(materialmovements.amount - materialmovements."realAmount"), 0) AS balance
        FROM materialmovements 
          JOIN materials ON materials.id = materialmovements."materialId"
          JOIN materialie ON materialie.id = materialmovements."movementId"
        WHERE materialmovements.active = true
          AND materialmovements.extra = true
          AND materialmovements.amount < 0
          AND materials.id = ${id}
      )
    ) * -1,

    "pendingAmount" = (
    SELECT COALESCE(SUM(materialmovements."amount"), 0) AS balance
      FROM materialmovements 
        JOIN materials ON materials.id = materialmovements."materialId"
        JOIN materialie ON materialie.id = materialmovements."movementId"
      WHERE materialmovements.active = true
        AND (materialie.location IS NOT NULL AND materialie.location <> 'At CST, Qtys verified')
        AND materials.id = ${id}
    )

    WHERE id = ${id} 
    returning amount`;
}
