export type ExcelCellValue = string | number | boolean | Date | null;

export type ExcelRow = ExcelCellValue[];

export type RawRouteRow = {
  rowNumber: number;
  routeHeader: string | null;
  date: string | null;
  timeSpentInObject: string | null;
  binCode: string | null;
  serviceDayPattern: string | null;
  frequencyCode: string | null;
  routeOrder: string | null;
  originalAddress: string | null;
  binVolume: string | null;
  containerCount: string | null;
};

export type ParsedRouteHeader = {
  raw: string;
  routeId: string;
  routeNumber: string;
  routeDate: string;
};

export type ServiceDayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ParsedServiceDays = {
  original: string | null;
  status: "known" | "unknown";
  days: ServiceDayName[];
  label: string;
};

export type ParsedFrequency = {
  original: string | null;
  status: "known" | "custom" | "unknown";
  intervalWeeks: number | null;
  label: string;
};

export type ParsedRouteStop = {
  id: string;
  routeId: string;
  routeNumber: string;
  routeDate: string;
  date: string;
  timeSpentInObject: string | null;
  binCode: string | null;
  serviceDayPattern: string | null;
  frequencyCode: string | null;
  routeOrder: number;
  originalAddress: string;
  cleanedAddress: string;
  serviceDays: ParsedServiceDays;
  frequency: ParsedFrequency;
  binVolume: number | null;
  containerCount: number | null;
  geocodingStatus: "pending";
  raw: RawRouteRow;
};

export type RouteParseWarning = {
  rowNumber: number;
  reason: string;
  raw: RawRouteRow;
};

export type RouteParseSummary = {
  inputFile: string;
  sheetName: string;
  totalRows: number;
  parsedStops: number;
  routeCount: number;
  routeHeadersDetected: number;
  invalidRows: number;
};
