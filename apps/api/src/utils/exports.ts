import { Column } from 'exceljs';
import { getTraducction } from './traduction';

interface ConvertTableToExcelProps {
  rows: any[];
  width?: number;
  customRows?: Array<Partial<Column>>;
}

export const convertTableToExcel = ({
  rows,
  width = 20,
  customRows,
}: ConvertTableToExcelProps) => {
  const keys = Object.keys(rows[0]);

  if (customRows) {
    for (const row of customRows) {
      keys.splice(keys.indexOf(row.key), 1);
    }
  }
  keys.splice(keys.indexOf('id'), 1);

  const generatedColumns = keys.map((key) => ({
    header: getTraducction(key),
    key,
    width,
  }));

  return [...(customRows || []), ...generatedColumns];
};
