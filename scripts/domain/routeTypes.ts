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

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeocodingStatus = "pending" | "geocoded" | "failed";

export type GeocodingProviderName = "nominatim";

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
  coordinates: Coordinates | null;
  geocodingStatus: GeocodingStatus;
  geocodingProvider: GeocodingProviderName | null;
  geocodingError: string | null;
  raw: RawRouteRow;
};

export type GeocodingSuccess = {
  status: "geocoded";
  cleanedAddress: string;
  query: string;
  provider: GeocodingProviderName;
  coordinates: Coordinates;
  displayName: string | null;
};

export type GeocodingFailure = {
  status: "failed";
  cleanedAddress: string;
  query: string;
  provider: GeocodingProviderName;
  error: string;
};

export type GeocodingCacheEntry = GeocodingSuccess | GeocodingFailure;

export type RouteStats = {
  routeKey: string;
  routeId: string;
  routeNumber: string;
  date: string;
  stopCount: number;
  uniqueAddressCount: number;
  totalContainers: number;
  totalBinVolume: number;
  geocodedStops: number;
  failedGeocodingStops: number;
  pendingGeocodingStops: number;
  serviceDays: string[];
  frequencies: string[];
  firstRouteOrder: number;
  lastRouteOrder: number;
};

export type DataSummary = {
  sourceFile: string;
  generatedFiles: string[];
  selectedWeekStart: string;
  selectedWeekEnd: string;
  totalStops: number;
  weekStops: number;
  routeCount: number;
  uniqueAddressCount: number;
  geocodedStops: number;
  failedGeocodingStops: number;
  pendingGeocodingStops: number;
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
