import type {
  GeocodingCacheEntry,
  GeocodingFailure,
  GeocodingSuccess,
  ParsedRouteStop,
} from "../domain/routeTypes";
import type { GeocodingProvider } from "../providers/GeocodingProvider";
import type { GeocodingCache } from "./geocodingCacheService";

export type GeocodingRunOptions = {
  delayMs: number;
  limit: number | null;
};

export type GeocodingRunResult = {
  routes: ParsedRouteStop[];
  cache: GeocodingCache;
  geocodedAddresses: GeocodingSuccess[];
  failedGeocoding: GeocodingFailure[];
  summary: {
    totalStops: number;
    uniqueAddresses: number;
    cachedAddresses: number;
    requestedAddresses: number;
    geocodedAddresses: number;
    failedAddresses: number;
    remainingPendingAddresses: number;
  };
};

export async function geocodeRouteStops(
  routes: ParsedRouteStop[],
  cache: GeocodingCache,
  provider: GeocodingProvider,
  options: GeocodingRunOptions,
): Promise<GeocodingRunResult> {
  const uniqueAddresses = getUniqueCleanedAddresses(routes);
  const addressesToRequest = uniqueAddresses
    .filter((address) => !cache[address])
    .slice(0, options.limit ?? undefined);

  for (const [index, address] of addressesToRequest.entries()) {
    if (index > 0 && options.delayMs > 0) {
      await delay(options.delayMs);
    }

    cache[address] = await provider.geocode(address);
  }

  const routesWithGeocoding = routes.map((routeStop) =>
    applyGeocodingEntry(routeStop, cache[routeStop.cleanedAddress] ?? null),
  );
  const cacheEntries = Object.values(cache);
  const geocodedAddresses = cacheEntries.filter(isGeocodingSuccess);
  const failedGeocoding = cacheEntries.filter(isGeocodingFailure);
  const cachedAddresses = uniqueAddresses.filter((address) => cache[address]).length;

  return {
    routes: routesWithGeocoding,
    cache,
    geocodedAddresses,
    failedGeocoding,
    summary: {
      totalStops: routes.length,
      uniqueAddresses: uniqueAddresses.length,
      cachedAddresses,
      requestedAddresses: addressesToRequest.length,
      geocodedAddresses: geocodedAddresses.length,
      failedAddresses: failedGeocoding.length,
      remainingPendingAddresses: uniqueAddresses.length - cachedAddresses,
    },
  };
}

function getUniqueCleanedAddresses(routes: ParsedRouteStop[]): string[] {
  return [...new Set(routes.map((routeStop) => routeStop.cleanedAddress))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function applyGeocodingEntry(
  routeStop: ParsedRouteStop,
  entry: GeocodingCacheEntry | null,
): ParsedRouteStop {
  if (!entry) {
    return routeStop;
  }

  if (entry.status === "geocoded") {
    return {
      ...routeStop,
      coordinates: entry.coordinates,
      geocodingStatus: "geocoded",
      geocodingProvider: entry.provider,
      geocodingError: null,
    };
  }

  return {
    ...routeStop,
    coordinates: null,
    geocodingStatus: "failed",
    geocodingProvider: entry.provider,
    geocodingError: entry.error,
  };
}

function isGeocodingSuccess(entry: GeocodingCacheEntry): entry is GeocodingSuccess {
  return entry.status === "geocoded";
}

function isGeocodingFailure(entry: GeocodingCacheEntry): entry is GeocodingFailure {
  return entry.status === "failed";
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
