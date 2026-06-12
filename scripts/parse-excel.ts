import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { inputRoutesFilePath, parsedRoutesOutputPath, toProjectRelativePath } from "./config/paths";
import { normalizeExcelRow } from "./domain/normalizeExcelRow";
import { parseRouteHeader } from "./domain/parseRouteHeader";
import type {
  ParsedRouteHeader,
  ParsedRouteStop,
  RouteParseSummary,
  RouteParseWarning,
} from "./domain/routeTypes";
import { readFirstWorksheetRows } from "./services/excelReader";

async function main(): Promise<void> {
  const { rows, sheetName } = readFirstWorksheetRows(inputRoutesFilePath);
  const stops: ParsedRouteStop[] = [];
  const warnings: RouteParseWarning[] = [];
  const routeIds = new Set<string>();
  let currentRoute: ParsedRouteHeader | null = null;

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 1;

    if (rowNumber === 1) {
      return;
    }

    const headerCandidate = parseRouteHeader(toCellText(row[0]));

    if (headerCandidate) {
      currentRoute = headerCandidate;
      routeIds.add(headerCandidate.routeId);
      return;
    }

    const result = normalizeExcelRow(row, rowNumber, currentRoute);

    if (result.kind === "stop") {
      stops.push(result.stop);
      return;
    }

    if (result.warning) {
      warnings.push(result.warning);
    }
  });

  await mkdir(path.dirname(parsedRoutesOutputPath), {
    recursive: true,
  });
  await writeFile(parsedRoutesOutputPath, `${JSON.stringify(stops, null, 2)}\n`);

  printSummary({
    inputFile: toProjectRelativePath(inputRoutesFilePath),
    sheetName,
    totalRows: rows.length,
    parsedStops: stops.length,
    routeCount: new Set(stops.map((stop) => stop.routeId)).size,
    routeHeadersDetected: routeIds.size,
    invalidRows: warnings.length,
  });

  if (warnings.length > 0) {
    console.log("\nFirst parser warnings:");
    warnings.slice(0, 10).forEach((warning) => {
      console.log(`- Row ${warning.rowNumber}: ${warning.reason}`);
    });
  }
}

function toCellText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function printSummary(summary: RouteParseSummary): void {
  console.log("Excel parsing summary");
  console.log(`- inputFile: ${summary.inputFile}`);
  console.log(`- sheetName: ${summary.sheetName}`);
  console.log(`- totalRows: ${summary.totalRows}`);
  console.log(`- parsedStops: ${summary.parsedStops}`);
  console.log(`- routeCount: ${summary.routeCount}`);
  console.log(`- routeHeadersDetected: ${summary.routeHeadersDetected}`);
  console.log(`- invalidRows: ${summary.invalidRows}`);
  console.log(`- outputFile: ${toProjectRelativePath(parsedRoutesOutputPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
