import type { ParsedRouteStop, RouteStats } from "../domain/routeTypes";

export function buildRouteStatistics(stops: ParsedRouteStop[]): RouteStats[] {
  return [...groupStopsByRouteAndDate(stops).values()]
    .map((routeStops) => {
      const sortedStops = sortStopsByRouteOrder(routeStops);
      const firstStop = sortedStops[0];
      const lastStop = sortedStops.at(-1);

      if (!firstStop || !lastStop) {
        throw new Error("Cannot build route statistics for an empty route group.");
      }

      return {
        routeKey: buildRouteKey(firstStop),
        routeId: firstStop.routeId,
        routeNumber: firstStop.routeNumber,
        date: firstStop.date,
        stopCount: sortedStops.length,
        uniqueAddressCount: new Set(sortedStops.map((stop) => stop.cleanedAddress)).size,
        totalContainers: sumNumbers(sortedStops.map((stop) => stop.containerCount)),
        totalBinVolume: sumNumbers(
          sortedStops.map((stop) =>
            stop.binVolume !== null && stop.containerCount !== null
              ? stop.binVolume * stop.containerCount
              : stop.binVolume,
          ),
        ),
        geocodedStops: sortedStops.filter((stop) => stop.geocodingStatus === "geocoded").length,
        failedGeocodingStops: sortedStops.filter((stop) => stop.geocodingStatus === "failed")
          .length,
        pendingGeocodingStops: sortedStops.filter((stop) => stop.geocodingStatus === "pending")
          .length,
        serviceDays: uniqueSortedLabels(sortedStops.map((stop) => stop.serviceDays.label)),
        frequencies: uniqueSortedLabels(sortedStops.map((stop) => stop.frequency.label)),
        firstRouteOrder: firstStop.routeOrder,
        lastRouteOrder: lastStop.routeOrder,
      };
    })
    .sort(
      (left, right) =>
        left.date.localeCompare(right.date) || left.routeId.localeCompare(right.routeId),
    );
}

export function buildRouteKey(stop: Pick<ParsedRouteStop, "routeId" | "date">): string {
  return `${stop.routeId}__${stop.date}`;
}

export function sortStopsByRouteOrder(stops: ParsedRouteStop[]): ParsedRouteStop[] {
  return [...stops].sort(
    (left, right) =>
      left.routeOrder - right.routeOrder ||
      left.routeId.localeCompare(right.routeId) ||
      left.id.localeCompare(right.id),
  );
}

function groupStopsByRouteAndDate(stops: ParsedRouteStop[]): Map<string, ParsedRouteStop[]> {
  const groups = new Map<string, ParsedRouteStop[]>();

  for (const stop of stops) {
    const routeKey = buildRouteKey(stop);
    const group = groups.get(routeKey);

    if (group) {
      group.push(stop);
    } else {
      groups.set(routeKey, [stop]);
    }
  }

  return groups;
}

function uniqueSortedLabels(labels: string[]): string[] {
  return [...new Set(labels)].sort((left, right) => left.localeCompare(right));
}

function sumNumbers(values: Array<number | null>): number {
  return roundToTwoDecimals(
    values.reduce<number>((sum, value) => (value === null ? sum : sum + value), 0),
  );
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
