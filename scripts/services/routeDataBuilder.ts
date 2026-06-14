import { addDays, formatISO, parseISO } from "date-fns";

import type { DataSummary, ParsedRouteStop, RouteStats } from "../domain/routeTypes";
import { sortStopsByRouteOrder } from "./routeStatisticsService";

export type WeekDataset = {
  weekStops: ParsedRouteStop[];
  weekStart: string;
  weekEnd: string;
};

export function buildRepresentativeWeekDataset(stops: ParsedRouteStop[]): WeekDataset {
  const availableDates = getAvailableDates(stops);

  if (availableDates.length === 0) {
    throw new Error("Cannot build week dataset from empty route data.");
  }

  const weekStart = selectWeekStart(stops, availableDates);
  const weekEnd = getWeekEnd(weekStart);
  const weekStops = sortStopsByRouteOrder(
    stops.filter((stop) => stop.date >= weekStart && stop.date <= weekEnd),
  ).sort(
    (left, right) =>
      left.date.localeCompare(right.date) || left.routeId.localeCompare(right.routeId),
  );

  return {
    weekStops,
    weekStart,
    weekEnd,
  };
}

function selectWeekStart(stops: ParsedRouteStop[], availableDates: string[]): string {
  const [firstDate] = availableDates;

  if (!firstDate) {
    throw new Error("Cannot select week start without available dates.");
  }

  return availableDates.reduce((bestDate, candidateDate) => {
    const bestScore = scoreWeek(stops, bestDate);
    const candidateScore = scoreWeek(stops, candidateDate);

    if (candidateScore.geocodedStops !== bestScore.geocodedStops) {
      return candidateScore.geocodedStops > bestScore.geocodedStops ? candidateDate : bestDate;
    }

    if (candidateScore.totalStops !== bestScore.totalStops) {
      return candidateScore.totalStops > bestScore.totalStops ? candidateDate : bestDate;
    }

    return candidateDate < bestDate ? candidateDate : bestDate;
  }, firstDate);
}

function scoreWeek(
  stops: ParsedRouteStop[],
  weekStart: string,
): {
  geocodedStops: number;
  totalStops: number;
} {
  const weekEnd = getWeekEnd(weekStart);
  const weekStops = stops.filter((stop) => stop.date >= weekStart && stop.date <= weekEnd);

  return {
    geocodedStops: weekStops.filter((stop) => stop.geocodingStatus === "geocoded").length,
    totalStops: weekStops.length,
  };
}

export function buildDataSummary(params: {
  sourceFile: string;
  generatedFiles: string[];
  selectedWeekStart: string;
  selectedWeekEnd: string;
  totalStops: number;
  weekStops: ParsedRouteStop[];
  routeStats: RouteStats[];
}): DataSummary {
  return {
    sourceFile: params.sourceFile,
    generatedFiles: params.generatedFiles,
    selectedWeekStart: params.selectedWeekStart,
    selectedWeekEnd: params.selectedWeekEnd,
    totalStops: params.totalStops,
    weekStops: params.weekStops.length,
    routeCount: params.routeStats.length,
    uniqueAddressCount: new Set(params.weekStops.map((stop) => stop.cleanedAddress)).size,
    geocodedStops: params.weekStops.filter((stop) => stop.geocodingStatus === "geocoded").length,
    failedGeocodingStops: params.weekStops.filter((stop) => stop.geocodingStatus === "failed")
      .length,
    pendingGeocodingStops: params.weekStops.filter((stop) => stop.geocodingStatus === "pending")
      .length,
  };
}

function getAvailableDates(stops: ParsedRouteStop[]): string[] {
  return [...new Set(stops.map((stop) => stop.date))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function getWeekEnd(weekStart: string): string {
  return formatDate(addDays(parseISO(weekStart), 6));
}

function formatDate(date: Date): string {
  return formatISO(date, {
    representation: "date",
  });
}
