import { defaultGeocodingContext } from "../config/domain";
import type { GeocodingCacheEntry } from "../domain/routeTypes";
import type { GeocodingProvider } from "./GeocodingProvider";

type NominatimSearchItem = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

const nominatimEndpoint = "https://nominatim.openstreetmap.org/search";
const provider = "nominatim";

export type NominatimGeocodingProviderOptions = {
  userAgent?: string;
  context?: string;
};

export class NominatimGeocodingProvider implements GeocodingProvider {
  private readonly userAgent: string;
  private readonly context: string;

  constructor(options: NominatimGeocodingProviderOptions = {}) {
    this.userAgent = options.userAgent ?? "waste-routes-test/1.0";
    this.context = options.context ?? defaultGeocodingContext;
  }

  async geocode(cleanedAddress: string): Promise<GeocodingCacheEntry> {
    const query = this.buildQuery(cleanedAddress);
    const url = new URL(nominatimEndpoint);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return {
          status: "failed",
          cleanedAddress,
          query,
          provider,
          error: `Nominatim request failed with HTTP ${response.status}`,
        };
      }

      const items = (await response.json()) as NominatimSearchItem[];
      const firstItem = items[0];
      const latitude = firstItem?.lat ? Number(firstItem.lat) : Number.NaN;
      const longitude = firstItem?.lon ? Number(firstItem.lon) : Number.NaN;

      if (!firstItem || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return {
          status: "failed",
          cleanedAddress,
          query,
          provider,
          error: "No geocoding result",
        };
      }

      return {
        status: "geocoded",
        cleanedAddress,
        query,
        provider,
        coordinates: {
          latitude,
          longitude,
        },
        displayName: firstItem.display_name ?? null,
      };
    } catch (error) {
      return {
        status: "failed",
        cleanedAddress,
        query,
        provider,
        error: error instanceof Error ? error.message : "Unknown geocoding error",
      };
    }
  }

  private buildQuery(cleanedAddress: string): string {
    return `${cleanedAddress}, ${this.context}`;
  }
}
