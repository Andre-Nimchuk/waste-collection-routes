import type { GeocodingCacheEntry } from "../domain/routeTypes";

export type GeocodingProvider = {
  geocode(cleanedAddress: string): Promise<GeocodingCacheEntry>;
};
