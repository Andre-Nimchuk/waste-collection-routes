import * as XLSX from "xlsx";

import type { ExcelRow } from "../domain/routeTypes";

export type ExcelWorksheetRows = {
  sheetName: string;
  rows: ExcelRow[];
};

export function readFirstWorksheetRows(filePath: string): ExcelWorksheetRows {
  const workbook = XLSX.readFile(filePath, {
    cellDates: true,
  });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(`Excel file has no worksheets: ${filePath}`);
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet is missing: ${sheetName}`);
  }

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    blankrows: false,
    defval: null,
    header: 1,
    raw: false,
  });

  return {
    sheetName,
    rows,
  };
}
