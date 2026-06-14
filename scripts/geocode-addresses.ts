import {
  failedGeocodingOutputPath,
  geocodedAddressesOutputPath,
  geocodedRoutesOutputPath,
  geocodingCachePath,
  parsedRoutesOutputPath,
  toProjectRelativePath,
} from "./config/paths";
import type { ParsedRouteStop } from "./domain/routeTypes";
import { NominatimGeocodingProvider } from "./providers/NominatimGeocodingProvider";
import { readGeocodingCache, writeGeocodingCache } from "./services/geocodingCacheService";
import { geocodeRouteStops } from "./services/geocodingService";
import { readJsonFile, writeJsonFile } from "./utils/jsonFile";

async function main(): Promise<void> {
  const routes = await readRoutes();
  const cache = await readGeocodingCache(geocodingCachePath);
  const result = await geocodeRouteStops(routes, cache, new NominatimGeocodingProvider(), {
    delayMs: getIntegerEnv("GEOCODING_DELAY_MS") ?? 1_000,
    limit: getIntegerEnv("GEOCODING_LIMIT"),
  });

  await writeJsonFile(geocodedRoutesOutputPath, result.routes);
  await writeJsonFile(geocodedAddressesOutputPath, result.geocodedAddresses);
  await writeJsonFile(failedGeocodingOutputPath, result.failedGeocoding);
  await writeGeocodingCache(geocodingCachePath, result.cache);

  printSummary(result.summary);
}

async function readRoutes(): Promise<ParsedRouteStop[]> {
  const parsed = await readJsonFile<unknown>(parsedRoutesOutputPath);

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected routes array in ${toProjectRelativePath(parsedRoutesOutputPath)}`);
  }

  return parsed as ParsedRouteStop[];
}

function getIntegerEnv(name: string): number | null {
  const value = process.env[name];

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return parsed;
}

function printSummary(summary: {
  totalStops: number;
  uniqueAddresses: number;
  cachedAddresses: number;
  requestedAddresses: number;
  geocodedAddresses: number;
  failedAddresses: number;
  remainingPendingAddresses: number;
}): void {
  console.log("Geocoding summary");
  console.log(`- inputFile: ${toProjectRelativePath(parsedRoutesOutputPath)}`);
  console.log(`- cacheFile: ${toProjectRelativePath(geocodingCachePath)}`);
  console.log(`- totalStops: ${summary.totalStops}`);
  console.log(`- uniqueAddresses: ${summary.uniqueAddresses}`);
  console.log(`- cachedAddresses: ${summary.cachedAddresses}`);
  console.log(`- requestedAddresses: ${summary.requestedAddresses}`);
  console.log(`- geocodedAddresses: ${summary.geocodedAddresses}`);
  console.log(`- failedAddresses: ${summary.failedAddresses}`);
  console.log(`- remainingPendingAddresses: ${summary.remainingPendingAddresses}`);
  console.log(`- routesOutput: ${toProjectRelativePath(geocodedRoutesOutputPath)}`);
  console.log(`- geocodedOutput: ${toProjectRelativePath(geocodedAddressesOutputPath)}`);
  console.log(`- failedOutput: ${toProjectRelativePath(failedGeocodingOutputPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
