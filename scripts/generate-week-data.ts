import {
  dataSummaryOutputPath,
  geocodedRoutesOutputPath,
  routeStatsOutputPath,
  toProjectRelativePath,
  weekRoutesOutputPath,
} from "./config/paths";
import type { DataSummary, ParsedRouteStop } from "./domain/routeTypes";
import { buildDataSummary, buildRepresentativeWeekDataset } from "./services/routeDataBuilder";
import { buildRouteStatistics } from "./services/routeStatisticsService";
import { readJsonFile, writeJsonFile } from "./utils/jsonFile";

async function main(): Promise<void> {
  const routes = await readRoutes();
  const weekDataset = buildRepresentativeWeekDataset(routes);
  const routeStats = buildRouteStatistics(weekDataset.weekStops);
  const dataSummary = buildDataSummary({
    sourceFile: toProjectRelativePath(geocodedRoutesOutputPath),
    generatedFiles: [
      toProjectRelativePath(weekRoutesOutputPath),
      toProjectRelativePath(routeStatsOutputPath),
      toProjectRelativePath(dataSummaryOutputPath),
    ],
    selectedWeekStart: weekDataset.weekStart,
    selectedWeekEnd: weekDataset.weekEnd,
    totalStops: routes.length,
    weekStops: weekDataset.weekStops,
    routeStats,
  });

  await writeJsonFile(weekRoutesOutputPath, weekDataset.weekStops);
  await writeJsonFile(routeStatsOutputPath, routeStats);
  await writeJsonFile(dataSummaryOutputPath, dataSummary);

  printSummary(dataSummary);
}

async function readRoutes(): Promise<ParsedRouteStop[]> {
  const parsed = await readJsonFile<unknown>(geocodedRoutesOutputPath);

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected routes array in ${toProjectRelativePath(geocodedRoutesOutputPath)}`);
  }

  return parsed as ParsedRouteStop[];
}

function printSummary(summary: DataSummary): void {
  console.log("Week data summary");
  console.log(`- sourceFile: ${summary.sourceFile}`);
  console.log(`- selectedWeekStart: ${summary.selectedWeekStart}`);
  console.log(`- selectedWeekEnd: ${summary.selectedWeekEnd}`);
  console.log(`- totalStops: ${summary.totalStops}`);
  console.log(`- weekStops: ${summary.weekStops}`);
  console.log(`- routeCount: ${summary.routeCount}`);
  console.log(`- uniqueAddressCount: ${summary.uniqueAddressCount}`);
  console.log(`- geocodedStops: ${summary.geocodedStops}`);
  console.log(`- failedGeocodingStops: ${summary.failedGeocodingStops}`);
  console.log(`- pendingGeocodingStops: ${summary.pendingGeocodingStops}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
