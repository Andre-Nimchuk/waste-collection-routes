import type { ParsedRouteHeader } from "./routeTypes";

const routeHeaderPattern = /^ML\s+(\d+)\s+no\s+(\d{2}\.\d{2}\.\d{2,4})$/i;

export function parseRouteHeader(value: string | null): ParsedRouteHeader | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().replace(/\s+/g, " ");
  const match = routeHeaderPattern.exec(normalizedValue);

  if (!match) {
    return null;
  }

  const [, routeNumber, routeDateToken] = match;
  const routeDate = parseExcelDateToken(routeDateToken ?? null);

  if (!routeNumber || !routeDate) {
    return null;
  }

  return {
    raw: value,
    routeId: `ML-${routeNumber}-${routeDate}`,
    routeNumber,
    routeDate,
  };
}

export function parseExcelDateToken(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return formatDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  const normalizedValue = value.trim();
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/.exec(normalizedValue);

  if (!match) {
    return null;
  }

  const [, dayToken, monthToken, yearToken] = match;

  if (!dayToken || !monthToken || !yearToken) {
    return null;
  }

  const day = Number(dayToken);
  const month = Number(monthToken);
  const year = yearToken.length === 2 ? 2000 + Number(yearToken) : Number(yearToken);

  if (!isValidDateParts(year, month, day)) {
    return null;
  }

  return formatDateParts(year, month, day);
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function formatDateParts(year: number, month: number, day: number): string {
  return [
    year.toString().padStart(4, "0"),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("-");
}
