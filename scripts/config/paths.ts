import path from "node:path";

export const projectRoot = process.cwd();

export const inputRoutesFilePath = path.join(
  projectRoot,
  "input",
  "Routes 01.01.2026-31.03.2026 tech test.xlsx",
);

export const parsedRoutesOutputPath = path.join(projectRoot, "src", "data", "routes.json");
export const geocodedRoutesOutputPath = path.join(
  projectRoot,
  "src",
  "data",
  "routes-geocoded.json",
);
export const geocodedAddressesOutputPath = path.join(
  projectRoot,
  "src",
  "data",
  "geocoded-addresses.json",
);
export const failedGeocodingOutputPath = path.join(
  projectRoot,
  "src",
  "data",
  "failed-geocoding.json",
);
export const geocodingCachePath = path.join(projectRoot, "cache", "geocoding-cache.json");

export function toProjectRelativePath(filePath: string): string {
  return path.relative(projectRoot, filePath);
}
