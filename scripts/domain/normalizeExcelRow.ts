import { parseDecimal, parseInteger } from "../utils/number";
import { normalizeOptionalText } from "../utils/text";
import { normalizeAddress } from "./normalizeAddress";
import { parseFrequency } from "./parseFrequency";
import { parseExcelDateToken } from "./parseRouteHeader";
import { parseServiceDays } from "./parseServiceDays";
import type {
  ExcelRow,
  ParsedRouteHeader,
  ParsedRouteStop,
  RawRouteRow,
  RouteParseWarning,
} from "./routeTypes";

type NormalizedExcelRowResult =
  | {
      kind: "stop";
      stop: ParsedRouteStop;
    }
  | {
      kind: "skip";
      warning?: RouteParseWarning;
    };

export function normalizeExcelRow(
  row: ExcelRow,
  rowNumber: number,
  currentRoute: ParsedRouteHeader | null,
): NormalizedExcelRowResult {
  const raw = toRawRouteRow(row, rowNumber);

  if (!hasMeaningfulCells(raw)) {
    return { kind: "skip" };
  }

  if (!currentRoute) {
    return {
      kind: "skip",
      warning: {
        rowNumber,
        reason: "Stop-like row appeared before a route header.",
        raw,
      },
    };
  }

  if (isRouteTotalRow(raw)) {
    return { kind: "skip" };
  }

  const routeOrder = parseInteger(raw.routeOrder);
  const originalAddress = normalizeOptionalText(raw.originalAddress);

  if (!originalAddress && routeOrder === null) {
    return { kind: "skip" };
  }

  if (!originalAddress || routeOrder === null) {
    return {
      kind: "skip",
      warning: {
        rowNumber,
        reason: "Stop row is missing route order or address.",
        raw,
      },
    };
  }

  const date = parseExcelDateToken(raw.date) ?? currentRoute.routeDate;

  return {
    kind: "stop",
    stop: {
      id: `${currentRoute.routeId}-${routeOrder}-${rowNumber}`,
      routeId: currentRoute.routeId,
      routeNumber: currentRoute.routeNumber,
      routeDate: currentRoute.routeDate,
      date,
      timeSpentInObject: normalizeOptionalText(raw.timeSpentInObject),
      binCode: normalizeOptionalText(raw.binCode),
      serviceDayPattern: normalizeOptionalText(raw.serviceDayPattern),
      frequencyCode: normalizeOptionalText(raw.frequencyCode),
      routeOrder,
      originalAddress,
      cleanedAddress: normalizeAddress(originalAddress),
      serviceDays: parseServiceDays(raw.serviceDayPattern),
      frequency: parseFrequency(raw.frequencyCode),
      binVolume: parseDecimal(raw.binVolume),
      containerCount: parseInteger(raw.containerCount),
      coordinates: null,
      geocodingStatus: "pending",
      geocodingProvider: null,
      geocodingError: null,
      raw,
    },
  };
}

export function toRawRouteRow(row: ExcelRow, rowNumber: number): RawRouteRow {
  return {
    rowNumber,
    routeHeader: cellToText(row[0] ?? null),
    date: cellToText(row[1] ?? null),
    timeSpentInObject: cellToText(row[2] ?? null),
    binCode: cellToText(row[3] ?? null),
    serviceDayPattern: cellToText(row[4] ?? null),
    frequencyCode: cellToText(row[5] ?? null),
    routeOrder: cellToText(row[6] ?? null),
    originalAddress: cellToText(row[7] ?? null),
    binVolume: cellToText(row[8] ?? null),
    containerCount: cellToText(row[9] ?? null),
  };
}

function isRouteTotalRow(raw: RawRouteRow): boolean {
  const address = normalizeOptionalText(raw.originalAddress);

  return (
    address === "Total:" ||
    address === "Kopā ML:" ||
    (raw.routeOrder === "0" && !address && parseInteger(raw.containerCount) === 0)
  );
}

function hasMeaningfulCells(raw: RawRouteRow): boolean {
  return Object.entries(raw).some(([key, value]) => key !== "rowNumber" && Boolean(value));
}

function cellToText(value: ExcelRow[number]): string | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}
