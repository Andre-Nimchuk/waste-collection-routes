import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { GeocodingCacheEntry } from "../domain/routeTypes";

export type GeocodingCache = Record<string, GeocodingCacheEntry>;

export async function readGeocodingCache(cachePath: string): Promise<GeocodingCache> {
  try {
    const content = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(content) as unknown;

    if (!isGeocodingCache(parsed)) {
      throw new Error(`Invalid geocoding cache shape: ${cachePath}`);
    }

    return parsed;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

export async function writeGeocodingCache(cachePath: string, cache: GeocodingCache): Promise<void> {
  await mkdir(path.dirname(cachePath), {
    recursive: true,
  });
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function isGeocodingCache(value: unknown): value is GeocodingCache {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
